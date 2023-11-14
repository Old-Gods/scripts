import { Command, Option } from 'clipanion'
import * as t from 'typanion'
import { BandcampCommand } from './BandcampCommand'
import { getMerch } from '../../../bandcamp'
import { pick } from 'lodash'

export class BandcampMerchCommand extends BandcampCommand {
  static override paths: string[][] = [['merch']]

  static override usage = Command.Usage({
    description:
      'Lists merchandise a label, band, or artist has available for purchase on Bandcamp',
  })

  readonly band_id = Option.String('-b,--band_id', {
    description:
      'Bandcamp ID of your label or the (usually) label on whose behalf you are querying.',
    required: true,
    validator: t.isNumber(),
  })

  readonly member_band_id = Option.String('-m,--member_band_id', {
    description: 'Bandcamp ID of the band on which you wish to filter results.',
    validator: t.isNumber(),
  })

  readonly start_time = Option.String('-s,--start_time', {
    description:
      'Earliest date the items you are interested in would have been added to Bandcamp.',
    required: true,
  })

  readonly end_time = Option.String('-e,--end_time', {
    description:
      'Latest date items you are in interested in would have been added to Bandcamp; defaults to the time of the call.',
  })

  readonly package_ids = Option.Array('-p,--package_ids', [], {
    description:
      'An array of package IDs that you wish to filter your results on.',
    validator: t.isArray(t.isNumber()),
  })

  readonly field = Option.Array('-f,--field', [], {
    description: 'Display only these fields. All by default.',
  })

  override async execute() {
    const spinner = this.startSpinner('Fetching merch')

    const merch = await getMerch(this)

    const data =
      this.field.length === 1
        ? merch.map((item: any) => item[this.field[0]])
        : this.field.length
          ? merch.map((item: any) => pick(item, this.field!))
          : merch

    spinner.stop()
    this.context.stdout.write(JSON.stringify(data, null, 2) + '\n')
  }
}
