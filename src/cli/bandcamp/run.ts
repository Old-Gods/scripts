import { runExit } from 'clipanion'
import { BandcampLoginCommand } from './commands/BandcampLoginCommand'
import { BandcampBandsCommand } from './commands/BandcampBandsCommand'
import { BandcampOrdersCommand } from './commands/BandcampOrdersCommand'
import { BandcampShipCommand } from './commands/BandcampShipCommand'
import { BandcampMerchCommand } from './commands/BandcampMerchCommand'
import { BandcampShippingOriginsCommand } from './commands/BandcampShippingOriginsCommand'

runExit(
  {
    binaryLabel: 'Bandcamp Scripts',
    binaryName: 'bandcamp',
    binaryVersion: require('../../../package.json').version,
  },
  [
    BandcampLoginCommand,
    BandcampBandsCommand,
    BandcampMerchCommand,
    BandcampOrdersCommand,
    BandcampShippingOriginsCommand,
    BandcampShipCommand,
  ],
)
