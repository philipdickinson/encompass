import { isEmpty } from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import * as React from 'react'
import { CONFIG } from '../../config/config'
import { ADEQUACY_COLORS } from '../../constants/colors'
import { AdequacyMode } from '../../constants/datatypes'
import { withStore } from '../../services/store'
import { summaryStatisticsByServiceArea } from '../../utils/data'
import { formatNumber } from '../../utils/formatters'
import { AdequacyDoughnut } from '../AdequacyDoughnut/AdequacyDoughnut'
import { CensusAdequacyCharts } from '../CensusAdequacyCharts/CensusAdequacyCharts'
import { CensusAdequacyTable } from '../CensusAdequacyTable/CensusAdequacyTable'
import { DownloadAnalysisLink } from '../DownloadAnalysisLink/DownloadAnalysisLink'
import { StatsBox } from '../StatsBox/StatsBox'
import './CensusAnalytics.css'

export let CensusAnalytics = withStore(
  'adequacies',
  'selectedServiceAreas',
  'serviceAreas'
)(({ store }) => {

  let selectedServiceAreas = store.get('selectedServiceAreas') ? store.get('selectedServiceAreas')! : store.get('serviceAreas')
  let selectedCensusCategory = store.get('selectedCensusCategory')
  let populationByAdequacy = summaryStatisticsByServiceArea(selectedServiceAreas, store)
  let totalPopulation = populationByAdequacy.reduce(function (a, b) { return a + b }, 0)
  let totalProviders = store.get('providers').length

  if (isEmpty(store.get('adequacies'))) {
    return <div className='CircularProgress Flex -Center'>
      <CircularProgress
        size={150}
        thickness={8}
        color={ADEQUACY_COLORS[AdequacyMode.ADEQUATE_0]}
      />
    </div>
  }
  return <div className='CensusAnalytics'>
    <StatsBox className='HighLevelStats' withBorders withFixedColumns>
      <tr>
        <th>Total Population</th>
        <th>Providers</th>
      </tr>
      <tr>
        <td className='NumericTableCell'>{formatNumber(totalPopulation)}</td>
        <td className='NumericTableCell'>{formatNumber(totalProviders)}</td>
      </tr>
    </StatsBox>
    <AdequacyChart
      include_census_data={CONFIG.include_census_data}
      selectedServiceAreas={selectedServiceAreas}
      selectedCensusCategory={selectedCensusCategory}
    />
  </div>
})

type Props = {
  include_census_data: boolean
  selectedServiceAreas: string[]
  selectedCensusCategory: string
}

let AdequacyChart: React.StatelessComponent<Props> = ({
  include_census_data, selectedServiceAreas, selectedCensusCategory
}) => {
  if (include_census_data === true) {
    return (
      <>
        <CensusAdequacyTable serviceAreas={selectedServiceAreas} censusCategory={selectedCensusCategory} />
        < div className='DownloadLink'>
          <DownloadAnalysisLink />
        </div>
        <CensusAdequacyCharts serviceAreas={selectedServiceAreas} censusCategory={selectedCensusCategory} />
      </>
    )
  }
  return (
    <>
      <AdequacyDoughnut serviceAreas={selectedServiceAreas} />
      < div className='DownloadLink'>
        <DownloadAnalysisLink />
      </div>
    </>
  )
}
