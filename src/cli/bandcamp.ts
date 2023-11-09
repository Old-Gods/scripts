import Bandcamp from '@nutriot/bandcamp-api'
import yargs from 'yargs'

yargs
  .scriptName('bandcamp')
  .usage('$0 <cmd> [args]')
  .command(
    'sales',
    'Get sales reports',
    async (yargs) => {
      const bandcamp = new Bandcamp()
      const credentials = await bandcamp.getClientCredentials()
      const bands = await bandcamp.getMyBands(credentials.access_token)
      if (bands.length > 1)
        yargs = yargs
          .option('band', {
            alias: 'b',
            choices: bands.map(band => band.name),
            coerce: (bandName) => bands.find(band => band.name === bandName)
          })
      return yargs
    },
    async (argv) => {
      const bandcamp = new Bandcamp()
      const credentials = await bandcamp.getClientCredentials()
      
    },
  )
