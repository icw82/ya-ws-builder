import { Request, Response, default as express } from 'express';
import { default as bodyParser } from 'body-parser';


type IServiceHandler = (req: Request, res: Response) => Promise<void>;

interface IServerParams {
    port: number;

    processPageX: IServiceHandler
}

class Server {
    readonly port: number;
    readonly processPageX: IServiceHandler;

    private readonly express: express.Application = express();

    constructor(params: IServerParams) {
        this.port = params.port;
        this.processPageX = params.processPageX;
    }

    run() {
        this.express.use( bodyParser.json() );

        this.express.get('/', (req, res) => {
            console.log('root >');
            res.send('Huinee');
        });

        // this.express.get('/service/', (req, res) => {
        //     console.log('/service >');
        //     res.send('service yeah');
        // });

        this.express.post('/service/', async(req, res) => {
            if (req.body.method === 'SiteNavigation.getPage') {
                await this.processPageX(req, res);

                return;
            }

            throw new Error('Метод не доступен (YA-BUILDER)');
        });

        this.express.listen(this.port, () => {
            console.log(`Крутится на http://localhost:${this.port}`);
        });
    }
}


export {
    Server,

    type IServiceHandler,
}
