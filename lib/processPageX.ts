import { Request } from 'express';

import { IServiceHandler } from '../classes/Server';
import { IPageXRoot } from './page-x-interface';


interface IRequestParams extends Request{
    body: {
        method: string;
        params: {
            Url: string;
        },
    }
}


const getData = async (pageName: string) => {
    const map = new Map<string, string>();

    const service = 'C:\Saby\sources\eo\custom-ui\service';

    map.set(
        'fnsRequirements',
        'C:\Saby\sources\eo\custom-ui\\'
    );
}

const processPageX: IServiceHandler = async (req: IRequestParams, res) => {
    const pageKey = req.body.params.Url;

    console.log('pageKey >', pageKey);
    console.log('req.header >', req.header);
    console.log('req.headers >', req.headers);

    // const url = new URL('http://localhost:3082/');
    const url = new URL(`${ req.headers.origin }${ req.path }`);

    const headers: HeadersInit = new Headers();

    headers.set('Cookie', req.headers['cookie']!);
    headers.set('Host', req.headers.origin!);

    headers.set('User-Agent', req.headers['user-agent']!);
    headers.set('Content-Type', req.headers['content-type']!);
    headers.set('Referer', req.headers.referer!);

    try {
        const result = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers,
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *client
            body: JSON.stringify(req.body),
        });
/*
POST /service/?x_version=23.7106-60 HTTP/1.1
Connection: keep-alive
Content-Length: 101
Pragma: no-cache
Cache-Control: no-cache
sec-ch-ua: "Not.A/Brand";v="8", "Chromium";v="114", "Microsoft Edge";v="114"
X-CalledMethod: SiteNavigation.getPage
X-LastModification: 2023-12-04T145247.952911+03
Accept-Language: ru-RU;q=0.8,en-US;q=0.5,en;q=0.3
sec-ch-ua-mobile: ?0
X-Requested-With: XMLHttpRequest
X-OSVersion: OSType=Windows;OSVersion=10.0;IsWin11=false
X-OriginalMethodName: U2l0ZU5hdmlnYXRpb24uZ2V0UGFnZQ==
sec-ch-ua-platform: "Windows"
Origin: https://test-online.sbis.ru
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Accept-Encoding: gzip, deflate, br
*/
        const originalData = await result.json() as IPageXRoot;

        // console.log('originalData >', originalData);

        originalData.result.title = 'YA-BUILDER';

        // const storeKey = 'pageFactory';

        // originalData.result.contentConfig.beforeTabsConfig.templateName =
        //     'EORegistry/application-react:TopContentController';

        // originalData.result.contentConfig.beforeTabsConfig.templateOptions.storeId = storeKey;

        // originalData.result.contentConfig.beforeTabsConfig.templateOptions.storeId = storeKey;

        // originalData.result.contentConfig.beforeTabsConfig.templateOptions.massPriorityOptions.storeId = storeKey;

        // originalData.result.contentConfig.filterConfig.filterTemplateName = 'EORegistry/application-react:FilterButton';
        // originalData.result.contentConfig.filterConfig.filterTemplateOptions.alignment = 'right';
        // originalData.result.contentConfig.filterConfig.filterTemplateOptions.storeId = storeKey;
        // originalData.result.contentConfig.filterConfig.searchTemplateName = 'EORegistry/application-react:FilterSearch';
        // originalData.result.contentConfig.filterConfig.searchTemplateOptions.storeId = storeKey;

        // originalData.result.contentConfig.masterConfig.bottomTemplateOptions.storeId = storeKey;

        /*
            // originalData.result['contentConfig.workspaceConfig']
            //     ['templateName'] = "EORegistry/application-react:ContentReact";
            // var workspaceConfigMasterOptions = Fiddler.WebFormats.JSON.JsonDecode(
            //     '{"masterWidthProperty": "ereportMasterWidthProperty","maxWidth": 200,"minWidth": 200,"storeId": "pageFactory"}'
            // );
            // originalData.result['contentConfig']['workspaceConfig']
            //     ['masterOptions'] = workspaceConfigMasterOptions.JSONObject;

            // var content = Fiddler.WebFormats.JSON.JsonEncode(data.JSONObject);
        */

        res.json(originalData);
    } catch (error) {
        console.error(error);
    }

    // const original = JSON.parse('{"jsonrpc":"2.0","result":{"access":true,"contentConfig":{"beforeTabsConfig":{"position":"topContent","templateName":"EORegistry/application-react:TopContentController","templateOptions":{"massPriorityComponent":"EORegistry/priorityOperation:Button","massPriorityOptions":{"counterName":"eofns.incoming.un_read"},"storeId":"pageFactory"}},"contrastBackground":true,"emptyViewConfig":{"emptyTemplateOptions":{"title":"Пока нет писем"},"emptyTemplateOptionsGetter":"ReportingEvents/base-react:emptyTemplateOptionsGetter","isEmptyCallback":"ReportingEvents/base-react:isEmptyCallback"},"filterConfig":{"autofocusSearch":true,"filterPosition":"right-top","filterTemplateName":"EORegistry/application-react:FilterButton","filterTemplateOptions":{"filterNames":["orgId","Recipient","date","deleted","unviewed"],"panelTemplateName":null,"storeId":"pageFactory"},"minSearchLength":null,"searchPosition":"left","searchTemplateName":"EORegistry/application-react:FilterSearch","searchTemplateOptions":{"filterNames":["Recipient"],"filterPlaceholder":"Найти...","storeId":"pageFactory"},"searchWidth":250},"helpButtonConfig":{"helpUrl":"https://sbis.ru/help/ereport/info"},"hideTabsArea":true,"langDictionary":"i18n!EORegistry","masterConfig":{"bottomTemplateName":"EORegistry/application-react:FilterPanel","bottomTemplateOptions":{"editorsViewMode":"cloud","filterNames":["Recipient","date","unviewed"],"storeId":"pageFactory"}},"prefetchConfig":{"configLoader":"EORegistry/ConfigLoaders/Letters","configLoaderArguments":{"accEORightsId":"ФНС_ВхПисьма","direction":"FNS","filter":{"ТипыДокументов":["РассылкаЭО"],"ФильтрПоТипуГосоргана":["ФНС"]},"historyId":"fnsIncomingLetters_2","scopesAreas":["FNSDirection"],"toolbarArguments":{"history":{"activateHandlerArguments":{"objectNames":["КомплектРассылкаЭОФНС"]}}},"type":"incoming"},"dependencies":["userInfo","permission"]},"prefetchModules":["EOComplect/complect","EOComplect/complectLayout","EOComplect/createFactory"],"preloadModules":["ReportingEvents/BaseActions"],"preloadTensorFontItalic":true,"toolbarConfig":{"actions":"EORegistry/actions:onlyHistory","getOperationsPanelVisibilityCallback":"EORegistry/application-react:visibilityCallback","storeId":"pageFactory","useOperationsPanel":true},"workspaceConfig":{"masterOptions":{"masterWidthProperty":"ereportMasterWidthProperty","maxWidth":200,"minWidth":200},"minWidth":772,"templateName":"EORegistry/application-react:ContentReact"}},"error":"","errorComponentNames":"","errorRec":"","id":"fnsIncomingLetters","isAdaptive":true,"licenseConfig":null,"parentId":"","rights":{"FNSDirection":{"level":"read"}},"title":"Входящие письма","type":""},"id":1,"protocol":6}');

    // original.result.title = 'shit';
}


export {
    processPageX,
};
