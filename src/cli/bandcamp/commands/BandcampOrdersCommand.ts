import { Command, Option } from 'clipanion'
import { pick } from 'lodash'
import * as t from 'typanion'
import { getOrders } from '../../../bandcamp'
import { BandcampCommand } from './BandcampCommand'

export class BandcampOrdersCommand extends BandcampCommand {
  static override paths: string[][] = [['orders']]

  static override usage = Command.Usage({
    description: 'Get current orders',
  })

  readonly band_id = Option.String('-b,--band_id', {
    required: true,
    validator: t.isNumber(),
  })

  readonly start_time = Option.String('-s,--start_time')

  readonly name = Option.String('-n,--name')

  readonly field = Option.Array('-f,--field', [])

  override async execute() {
    const spinner = this.startSpinner('Fetching orders')

    const orders = await getOrders(this)

    const data =
      this.field.length === 1
        ? orders.map((item: any) => item[this.field[0]])
        : this.field.length
          ? orders.map((item: any) => pick(item, this.field!))
          : orders

    spinner.stop()
    this.context.stdout.write(JSON.stringify(data, null, 2) + '\n')
  }
}
