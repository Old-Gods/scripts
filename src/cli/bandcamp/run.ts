import { runExit } from 'clipanion'
import { BandcampLoginCommand } from './commands/BandcampLoginCommand'
import { BandcampBandsCommand } from './commands/BandcampBandsCommand'
import { BandcampOrdersCommand } from './commands/BandcampOrdersCommand'

runExit([BandcampLoginCommand, BandcampBandsCommand, BandcampOrdersCommand])
