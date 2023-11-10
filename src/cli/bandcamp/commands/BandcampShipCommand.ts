import { Command, Option } from 'clipanion'
import { setTimeout } from 'node:timers/promises'
import * as t from 'typanion'
import { loadJSON } from '../../../fs'
import { getOrders, updateShipping } from '../../../bandcamp'
import { pick } from 'lodash'
import { BandcampCommand } from './BandcampCommand'

export class BandcampShipCommand extends BandcampCommand {
  static override paths: string[][] = [['ship']]

  static override usage = Command.Usage({
    description: 'Update shipping information on certain orders',
  })

  readonly band_id = Option.String('-b,--band_id', {
    required: true,
    validator: t.isNumber(),
  })

  readonly carrier = Option.String('-c,--carrier')

  readonly commit = Option.Boolean('-C,--commit')

  readonly interval = Option.String('-i,--interval', {
    validator: t.isNumber(),
  })

  readonly ids_file = Option.String('-f,--ids_file')

  readonly id_type = Option.String('-t,--id_type', 'p', {
    validator: t.isEnum(['p', 's'] as const),
  })

  readonly name = Option.String('-n,--name')

  readonly notify = Option.Boolean('-N,--noditify')

  readonly ship_date = Option.String('-d,--ship_date')

  readonly shipped = Option.Boolean('-S,--shipped')

  readonly start_date = Option.String('-s,--start_time')

  override async execute() {
    const ids: number[] = this.ids_file
      ? t.isArray(t.isNumber())(await loadJSON(this.ids_file))
      : (await getOrders(this)).items.map((item: any) =>
          this.id_type === 'p' ? item.payment_id : item.sale_item_id,
        )

    const options = pick(this, ['id_type', 'ship_date', 'shipped', 'carrier'])

    if (!this.commit) {
      console.info('Dry run')
      console.info('Setting', options)
      console.info(`TO ${ids.length} ids`)
      console.info(ids)
      return
    }

    console.info(`SUBMITTING ${ids.length} IDs TO BANDCAMP`)
    await setTimeout(5_000)

    await updateShipping(
      ids.map((id) => ({
        ...options,
        id,
      })),
    )

    console.info('Success')
  }
}
