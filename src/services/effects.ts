import { Store } from 'babydux'
import { chain, keyBy } from 'lodash'
import { Observable } from 'rx'
import { Measure, RepresentativePoint, Standard } from '../constants/datatypes'
import { TIME_DISTANCES } from '../constants/timeDistances'
import { getAdequacies, getRepresentativePoints, isWriteProvidersSuccessResponse, postProviders, ReadAdequaciesResponse, WriteProvidersErrorResponse, WriteProvidersRequest, WriteProvidersResponse, WriteProvidersSuccessResponse } from './api'
import { Actions } from './store'

export function withEffects(store: Store<Actions>) {

  /**
   * Update representative points when distribution or serviceAreas change
   */
  Observable
    .combineLatest(
    store.on('distribution').startWith(store.get('distribution')),
    store.on('serviceAreas').startWith(store.get('serviceAreas'))
    )
    .subscribe(async ([distribution, serviceAreas]) => {
      let points = await getRepresentativePoints(serviceAreas)

      // Backend returns representative points for all distances at once.
      // Frontend then plucks out the points it needs, duck-typing on whether or
      // not the given point's `population` object has the current distance
      // defined as a key on it.
      store.set('representativePoints')(
        chain(points)
          .filter(_ => distribution in _.population)
          .map(_ => ({
            ..._,
            population: _.population[distribution]!
          }))
          .value()
      )
    })

  /**
   * Geocode providers when uploadedProviders changes
   *
   * TODO: Expose errors to user
   */
  store.on('uploadedProviders')
    .debounce(100)
    .subscribe(async providers => {
      let result = await postProviders(providers)
      store.set('providers')(
        chain(result)
          .zip<WriteProvidersResponse | WriteProvidersRequest>(providers)
          .partition(([res]: [WriteProvidersResponse]) => isWriteProvidersSuccessResponse(res))
          .tap(([_, errors]) => console.log('POST /api/provider errors:', errors))
          .first()
          .map(([res, req]: [WriteProvidersSuccessResponse, WriteProvidersRequest]) => ({
            ...req,
            lat: res.lat,
            lng: res.lng,
            id: res.id
          }))
          .value()
      )
    })

  /**
   * Fetch adequacies when providers, representative points, measure, or standard change
   */
  Observable
    .combineLatest(
    store.on('providers'),
    store.on('representativePoints'),
    store.on('measure').startWith(store.get('measure')),
    store.on('standard').startWith(store.get('standard'))
    )
    .subscribe(async ([providers, representativePoints, measure, standard]) => {
      let adequacies = await getAdequacies(providers.map(_ => _.id), store.get('serviceAreas'))
      store.set('adequacies')(
        chain(representativePoints.map(_ => _.id))
          .zipObject(adequacies)
          .mapValues(_ => isAdequate(
            _.distance_to_closest_provider,
            _.time_to_closest_provider,
            measure,
            standard
          ))
          .value()
      )
    })

  return store
}

function isAdequate(
  distance: number,
  time: number,
  measure: Measure,
  standard: Standard
) {
  switch (standard) {
    case 'distance':
      return distance < measure
    case 'time_distance':
      return distance < measure && time < TIME_DISTANCES.get(measure)!
    case 'time':
      return time < TIME_DISTANCES.get(measure)!
  }
}
