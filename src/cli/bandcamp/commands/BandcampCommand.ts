import { Command } from 'clipanion'
import { formatError } from '../../../bandcamp'
import ora, { Ora } from 'ora'

export abstract class BandcampCommand extends Command {
  #spinner?: Ora

  override async catch(error: unknown) {
    this.#spinner?.stop()
    this.context.stderr.write(formatError(error) + '\n')
  }

  protected startSpinner(label: string) {
    const spinner = (this.#spinner = ora(label).start())
    return spinner
  }
}
