import { Command, Option } from 'clipanion'
import * as t from 'typanion'
import { BandcampCommand } from './BandcampCommand'
import { getShippingOrigins } from '../../../bandcamp'

export class BandcampShippingOriginsCommand extends BandcampCommand {
  static override paths: string[][] = [['shipping']]

  static override usage = Command.Usage({
    description:
      'Lists the shipping origins for artists and labels linked to your account on Bandcamp.',
    details: /* md */ `
## Return Values

origin_id
: the Bandcamp ID of the shipping origin (use this in calls to other endpoints)

band_id
: the Bandcamp ID of the artist or label this shipping origin is associated with

country_name
: the name of the country that this shipping origin is located in

state_name
: the name of the state that this shipping origin is located in, if available

state_code
: the two-character code for the state that this shipping origin is located in, if available    
`,
  })

  readonly band_id = BandcampCommand.BandIdOption(false)

  readonly origin_id = Option.String('-o,--origin_id', {
    description:
      'Bandcamp ID of a specific shipping origin you want to retrieve details for.',
    validator: t.isNumber(),
  })

  override async execute() {
    const spinner = this.startSpinner('Fetching shipping origins')
    const data = await getShippingOrigins(this)
    spinner.stop()
    this.context.stdout.write(JSON.stringify(data, null, 2) + '\n')
  }
}
