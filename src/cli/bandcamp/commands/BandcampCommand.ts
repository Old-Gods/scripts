import { Command } from 'clipanion'
import { formatError } from '../../../bandcamp'

export abstract class BandcampCommand extends Command {
  override async catch(error: unknown) {
    this.context.stderr.write(formatError(error) + '\n')
  }
}
