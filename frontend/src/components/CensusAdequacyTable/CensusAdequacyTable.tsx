import 'chart.piecelabel.js'
import 'chartjs-plugin-stacked100'
import { isEmpty } from 'lodash'
import CircularProgress from 'material-ui/CircularProgress'
import * as React from 'react'
import { CENSUS_MAPPING } from '../../constants/census'
import { ADEQUACY_COLORS } from '../../constants/colors'
import { AdequacyMode, Format, PopulationByAdequacy } from '../../constants/datatypes'
import { withStore } from '../../services/store'
import { summaryStatisticsByServiceAreaAndCensus } from '../../utils/data'
import { formatNumber, formatPercentage } from '../../utils/formatters'
import { getLegend } from '../MapLegend/MapLegend'
import { StatsBox } from '../StatsBox/StatsBox'
import {
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table'

type Props = {
  serviceAreas: string[],
  censusCategory: string
}

// Force first column to be larger than the other ones.
let firstColumnStyle = {
  width: '30%'
}

/**
 * Use circular legend patches instead of the default rectangles.
 *
 * TODO: Fix typings upstream in DefinitelyTyped/chart.js
 */
// (Chart as any).defaults.global.legend.labels.usePointStyle = true

export let CensusAdequacyTable = withStore('adequacies', 'method')<Props>(({ serviceAreas, censusCategory, store }) => {
  if (isEmpty(store.get('adequacies'))) {
    return <div className='CensusAdequacyTable Flex -Center'>
      <CircularProgress
        size={150}
        thickness={8}
        color={ADEQUACY_COLORS[AdequacyMode.ADEQUATE_0]}
      />
    </div>
  }

  let format = store.get('selectedFormat')
  let method = store.get('method')

  // Calculate summaryStatistics for each group.
  let populationByAdequacyByGroup = summaryStatisticsByServiceAreaAndCensus(serviceAreas, censusCategory, store)
  let censusGroups = ['Total'].concat(CENSUS_MAPPING[censusCategory])

  return <div>
    <StatsBox>
      <TableRow>
        <TableHeaderColumn style={firstColumnStyle}>Group</TableHeaderColumn>
        <TableHeaderColumn>{getLegend(method, AdequacyMode.ADEQUATE_0)}</TableHeaderColumn>
        <TableHeaderColumn>{getLegend(method, AdequacyMode.ADEQUATE_1)}</TableHeaderColumn>
        <TableHeaderColumn>{getLegend(method, AdequacyMode.ADEQUATE_2)}</TableHeaderColumn>
        <TableHeaderColumn>{getLegend(method, AdequacyMode.INADEQUATE)}</TableHeaderColumn>
      </TableRow>
      {
        censusGroups.map(censusGroup =>
          adequacyRowByCensusGroup(censusGroup, populationByAdequacyByGroup[censusGroup], format)
        )
      }
    </StatsBox>
  </div>
})

function adequacyRowByCensusGroup(censusGroup: string, populationByAdequacy: PopulationByAdequacy, format: Format) {
  let totalPopulation = populationByAdequacy.reduce((a: number, b: number) => a + b)
  return (
    <TableRow>
      <TableRowColumn>{censusGroup}</TableRowColumn>
      {
        populationByAdequacy.map(_ => {
          if (format === 'Percentage') {
            return (<TableRowColumn className='NumericTableCell'>{formatPercentage(100 * _ / totalPopulation)}</TableRowColumn>)
          } else {
            return (<TableRowColumn className='NumericTableCell'>{formatNumber(_)}</TableRowColumn>)
          }
        })
      }
    </TableRow>
  )
}
