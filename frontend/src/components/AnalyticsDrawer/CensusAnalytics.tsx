import { isEmpty } from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import * as React from 'react'
import { ADEQUACY_COLORS } from '../../constants/colors'
import { AdequacyMode } from '../../constants/datatypes'
import { withStore } from '../../services/store'
import { summaryStatisticsByServiceArea } from '../../utils/data'
import { formatNumber } from '../../utils/formatters'
import { CensusAdequacyCharts } from '../CensusAdequacyCharts/CensusAdequacyCharts'
import { CensusAdequacyTable } from '../CensusAdequacyTable/CensusAdequacyTable'
import { DownloadAnalysisLink } from '../DownloadAnalysisLink/DownloadAnalysisLink'
import { StatsBox } from '../StatsBox/StatsBox'
import {
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table'
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
    return <div className='CensusAdequacyCharts Flex -Center'>
      <CircularProgress
        size={150}
        thickness={8}
        color={ADEQUACY_COLORS[AdequacyMode.ADEQUATE_0]}
      />
    </div>
  }
  return <div className='CensusAnalytics'>
    <StatsBox>
      <TableRow>
        <TableHeaderColumn>Total Population</TableHeaderColumn>
        <TableHeaderColumn>Providers</TableHeaderColumn>
      </TableRow>
      <TableRow>
        <TableRowColumn className='NumericTableCell'>{formatNumber(totalPopulation)}</TableRowColumn>
        <TableRowColumn className='NumericTableCell'>{formatNumber(totalProviders)}</TableRowColumn>
      </TableRow>
    </StatsBox>
    <CensusAdequacyTable serviceAreas={selectedServiceAreas} censusCategory={selectedCensusCategory} />
    <div className='DownloadLink'>
      <DownloadAnalysisLink />
    </div>
    <CensusAdequacyCharts serviceAreas={selectedServiceAreas} censusCategory={selectedCensusCategory} />
  </div>
})
