import { Command, Option } from 'clipanion'
import { pick } from 'lodash'
import * as t from 'typanion'
import { getOrders } from '../../../bandcamp'
import { BandcampCommand } from './BandcampCommand'

export class BandcampOrdersCommand extends BandcampCommand {
  static override paths: string[][] = [['orders']]

  static override usage = Command.Usage({
    description: 'Lists merchandise orders placed with a band or label.',
    details: /* md */ `
## Response Values

order_date
: date order was placed

sale_item_id
: Bandcamp ID for sale item

payment_id
: Bandcamp ID for payment; multiple items share the same payment_id when more than one item is purchased in the same transaction

paypal_id
: PayPal's ID for the transaction, if it exists

sku
: SKU applied to merch item by band or label, if a SKU has been applied to the merch item. If the thing purchased comes in several options, the SKU here is that of option purchased.

item_name
: name of the merch item, on Bandcamp

item_url
: URL to the item, on Bandcamp

artist
: artist's or band's name

option
: option name, if it exists

discount_code
: discount code, if it exists

sub_total
: total before taxes

tax
: taxes applied to sale

quantity
: number of this particular sale item

ship_from_country_name
: merch store to ship from

shipping
: shipping costs

currency
: currency of transcation

order_total
: total charge

buyer_name
: buyer's name

buyer_email
: buyer's email address

buyer_note
: note written by the purchaser, at the time of purchase, via the Bandcamp checkout UI

ship_notes
: notes written by the purchaser, at the time of purchase, via the PayPal checkout UI

buyer_phone
: buyer's telephone

ship_to_name
: name to ship order to

ship_to_street
: street name, for shipping

ship_to_street_2
: second line of street name, if exists, for shipping

ship_to_city
: city name, for shipping

ship_to_state
: state / region within country, if exists, for shipping

ship_to_country
: country name, for shipping

ship_to_country_code
: ISO two letter country code, for shipping

ship_to_zip
: postal code

ship_date
: date on which item is marked as shipped, null when item hasn't yet shipped

payment_state
: pending, paid, or refunded
`,
  })

  readonly band_id = BandcampCommand.BandIdOption()

  readonly member_band_id = BandcampCommand.MemberBandIdOption()

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
