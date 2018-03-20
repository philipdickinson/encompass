import * as React from 'react'
import {
  Table,
  TableBody
} from 'material-ui/Table'

type Props = {
}

export let StatsBox: React.StatelessComponent<Props> = ({
  children
}) =>
  <Table>
    {/*<TableHeader>*/}
      {/*<TableRow>*/}
        {/*<TableHeaderColumn></TableHeaderColumn>*/}
        {/*<TableHeaderColumn></TableHeaderColumn>*/}
        {/*<TableHeaderColumn></TableHeaderColumn>*/}
      {/*</TableRow>*/}
    {/*</TableHeader>*/}
    <TableBody displayRowCheckbox={false}>{children}</TableBody>
  </Table>
