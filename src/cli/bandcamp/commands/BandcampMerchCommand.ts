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
    details: /* md */ `
## Response Values

package_id
: the Bandcamp ID of the merch item (use this in calls to other endpoints)

album_title
: if this is music merch (cd, vinyl, cassette), the name of album it's associated with

title
: name of the item for sale

image_url
: URL of the image on Bandcamp associated with this item

quantity_available
: number of units available for sale (i.e. which Bandcamp thinks it can still sell) across all shipping origins; null means unlimited

quantity_sold
: number of units that have been sold on Bandcamp across all shipping origins

price
: price per item

currency
: currency in which price is listed

subdomain
: the Bandcamp subdomain where the item can be found

is_set_price
: can the user pay more than the asking price if they want?

sku
: item sku

options
: options information in array form, one item for each option; null when there are no options. Each item in the array contains these fields:

- option_id (i.e., the unique Bandcamp ID for this option)
- quantity_sold
- quantity_available
- title
- sku

origin_quantities
: quantities per shipping origin. Each item in the array contains these fields:

- origin_id (i.e., the unique Bandcamp ID for this shipping origin)
- quantity_available
- quantity_sold
- option_quantities quantities at this shipping origin per option. Each item in the array contains these fields:
- option_id (i.e., the unique Bandcamp ID for this option)
- quantity_available
- quantity_sold
`,
  })

  readonly band_id = BandcampCommand.BandIdOption()

  readonly member_band_id = BandcampCommand.MemberBandIdOption()

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
