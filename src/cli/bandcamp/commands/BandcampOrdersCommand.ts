import { Command, Option } from 'clipanion'
import { pick } from 'lodash'
import * as t from 'typanion'
import { getOrders } from '../../../bandcamp'
import { BandcampCommand } from './BandcampCommand'

export class BandcampOrdersCommand extends BandcampCommand {
  static override paths: string[][] = [['orders']]

  static override usage = Command.Usage({
    description: 'Lists merchandise orders placed with a band or label.',
  })

  readonly band_id = Option.String('-b,--band_id', {
    description:
      'Bandcamp ID of your label or the (usually) label on whose behalf you are querying.',
    required: true,
    validator: t.isNumber(),
  })

  readonly band_member_id = Option.String('-m,--band_member_id', {
    description: 'Bandcamp ID of band to filter on; defaults to all.',
    validator: t.isNumber(),
  })

  readonly start_time = Option.String('-s,--start_time', {
    description: "Earliest sale dates you're interested in.",
  })

  readonly end_time = Option.String('-e,--end_time', {
    description: "Eatest sale dates you're interested in",
  })

  readonly unshipped_only = Option.Boolean('-u,--unshipped_only', false, {
    description: 'Query for unshipped orders only.',
  })

  readonly name = Option.String('-n,--name', {
    description: 'Filter orders on this item name (or title).',
  })

  readonly origin_id = Option.String('-o,--origin_id', {
    description: 'Filter orders on a particular shipping origin.',
    validator: t.isNumber(),
  })

  readonly field = Option.Array('-f,--field', [], {
    description: 'Display only these fields. All by default.',
  })

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
