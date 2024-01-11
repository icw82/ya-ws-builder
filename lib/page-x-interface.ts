interface IPageXRoot {
    jsonrpc: '2.0';
    result: IPageXResult
    id: number
    protocol: number
}

interface IPageXResult {
    access: boolean
    contentConfig: IPageXContentConfig
    error: string
    errorComponentNames: string
    errorRec: string
    id: string
    isAdaptive: boolean
    // licenseConfig: null
    parentId: string
    rights: Record<string, {level: 'read' /* ??? */}>,
    title: string
    type: string
}

interface IPageXContentConfig {
    addButtonConfig: AddButtonConfig
    beforeTabsConfig: BeforeTabsConfig
    contrastBackground: boolean
    emptyViewConfig: EmptyViewConfig
    filterConfig: FilterConfig
    helpButtonConfig: HelpButtonConfig
    hideTabsArea: boolean
    highlightContentArea: boolean
    langDictionary: string
    masterConfig: MasterConfig
    prefetchConfig: PrefetchConfig
    prefetchModules: string[]
    preloadModules: string[]
    preloadTensorFontItalic: boolean
    toolbarConfig: ToolbarConfig
    workspaceConfig: WorkspaceConfig
}

//         "contentConfig": {
//             "addButtonConfig": {
//                 "activateHandler": "EORegistry/CreateButtonConfigGetter:activate",
//                 "dependencies": ["prefetch"],
//                 "getCaptionCallback": "EORegistry/application-react:captionCallback",
//                 "getVisibilityCallback": "EORegistry/application-react:visibilityCallback",
//                 "menuConfigGetter": "EORegistry/CreateButtonConfigGetter:getConfig",
//                 "menuConfigGetterArguments": {
//                     "Used": true,
//                     "ВыбратьДокументы": [
//                         "ОтчетФНС.1151162",
//                         "ОтчетФНС.1110355"
//                     ],
//                     "ДобавитьКВыбранным": true,
//                     "ТипыДокументов": ["ОтчетФНС"]
//                 }
//             },
//             "beforeTabsConfig": {
//                 "position": "topContent",
//                 "templateName": "EORegistry/application-react:TopContentController",
//                 "templateOptions": {
//                     "counterName": "eofns.reports",
//                     "counterStoreId": "sourceForCountersFactory",
//                     "storeId": "pageFactory"
//                 }
//             },
//             "contrastBackground": true,
//             "emptyViewConfig": {
//                 "emptyTemplateOptions": {
//                     "content": [
//                         {
//                             "data": {
//                                 "url": "https://sbis.ru/help/ereport/create_send/fill",
//                                 "value": "Создайте"
//                             },
//                             "type": "link"
//                         },
//                         { "data": { "value": " " }, "type": "text" },
//                         { "data": { "value": "или" }, "type": "text" },
//                         { "data": { "value": " " }, "type": "text" },
//                         {
//                             "data": {
//                                 "url": "https://sbis.ru/help/ereport/create_send/loading",
//                                 "value": "загрузите"
//                             },
//                             "type": "link"
//                         },
//                         { "data": { "value": " " }, "type": "text" },
//                         {
//                             "data": {
//                                 "value": "отчеты и сдайте их в Налоговую"
//                             },
//                             "type": "text"
//                         },
//                         { "data": { "value": ". " }, "type": "text" },
//                         {
//                             "data": {
//                                 "value": "СБИС поможет заполнить формы, проверит их на наличие ошибок, а также покажет состояние сдачи"
//                             },
//                             "type": "text"
//                         },
//                         { "data": { "value": "." }, "type": "text" }
//                     ],
//                     "title": "Пока нет отчетов"
//                 },
//                 "emptyTemplateOptionsGetter": "ReportingEvents/base-react:emptyTemplateOptionsGetter",
//                 "isEmptyCallback": "ReportingEvents/base-react:isEmptyCallback"
//             },
//             "filterConfig": {
//                 "autofocusSearch": true,
//                 "filterPosition": "right-top",
//                 "filterTemplateName": "EORegistry/application-react:FilterButton",
//                 "filterTemplateOptions": {
//                     "filterNames": [
//                         "orgId",
//                         "DocTypeKey",
//                         "Recipient",
//                         "date",
//                         "period",
//                         "employee",
//                         "author",
//                         "responsible",
//                         "deleted",
//                         "branchId"
//                     ],
//                     "panelTemplateName": null,
//                     "storeId": "pageFactory"
//                 },
//                 "minSearchLength": null,
//                 "searchPosition": "left",
//                 "searchTemplateName": "EORegistry/application-react:FilterSearch",
//                 "searchTemplateOptions": {
//                     "filterNames": ["DocTypeKey", "Recipient"],
//                     "storeId": "pageFactory"
//                 },
//                 "searchWidth": 250
//             },
//             "helpButtonConfig": {
//                 "helpUrl": "https://sbis.ru/help/ereport/ni"
//             },
//             "hideTabsArea": true,
//             "highlightContentArea": true,
//             "langDictionary": "i18n!EORegistry",
//             "masterConfig": {
//                 "bottomTemplateName": "EORegistry/application-react:FilterPanel",
//                 "bottomTemplateOptions": {
//                     "editorsViewMode": "cloud",
//                     "filterNames": [
//                         "DocTypeKey",
//                         "Recipient",
//                         "period",
//                         "deleted",
//                         "branchId"
//                     ],
//                     "storeId": "pageFactory"
//                 }
//             },
//             "prefetchConfig": {
//                 "configLoader": "EORegistry/ConfigLoaders/Main",
//                 "configLoaderArguments": {
//                     "accEORightsId": "ФНС_Отчеты",
//                     "direction": "ФНС",
//                     "historyId": "appFnsReport_1",
//                     "scopesAreas": ["FNSDirection"],
//                     "toolbarArguments": {
//                         "history": {
//                             "activateHandlerArguments": {
//                                 "objectNames": ["КомплектФНС"]
//                             }
//                         },
//                         "mainLoadButton": {
//                             "activateHandlerArguments": { "type": "ОтчетФНС" },
//                             "load": { "excelLoaderRegister": "ОтчетФНС" }
//                         },
//                         "unload": { "visibilityParam": "hasRights" }
//                     },
//                     "typesDocuments": ["ОтчетФНС"]
//                 },
//                 "dependencies": ["userInfo", "permission"]
//             },
//             "prefetchModules": [
//                 "EOComplect/complect",
//                 "EOComplect/complectLayout",
//                 "EOComplect/createFactory"
//             ],
//             "preloadModules": ["css!EORegistry/mainRegister"],
//             "preloadTensorFontItalic": true,
//             "toolbarConfig": {
//                 "actions": "EORegistry/actions:baseActions",
//                 "getOperationsPanelVisibilityCallback": "EORegistry/application-react:visibilityCallbackMassMain",
//                 "storeId": "pageFactory",
//                 "useOperationsPanel": true
//             },
//             "workspaceConfig": {
//                 "masterOptions": {
//                     "masterWidthProperty": "ereportMasterWidthProperty",
//                     "maxWidth": 200,
//                     "minWidth": 200
//                 },
//                 "minWidth": 772,
//                 "templateName": "EORegistry/application-react:ContentReact"
//             }
//         },

interface AddButtonConfig {
    activateHandler: string
    dependencies: string[]
    getCaptionCallback: string
    getVisibilityCallback: string
    menuConfigGetter: string
    menuConfigGetterArguments: MenuConfigGetterArguments
}

interface MenuConfigGetterArguments {
    Used: boolean
    ВыбратьДокументы: string[]
    ДобавитьКВыбранным: boolean
    ТипыДокументов: string[]
}

interface BeforeTabsConfig {
    position: string
    templateName: string
    templateOptions: TemplateOptions
}

interface TemplateOptions {
    counterName: string
    counterStoreId: string
    storeId: string
}

interface EmptyViewConfig {
    emptyTemplateOptions: EmptyTemplateOptions
    emptyTemplateOptionsGetter: string
    isEmptyCallback: string
}

interface EmptyTemplateOptions {
    content: Content[]
    title: string
}

interface Content {
    data: Data
    type: string
}

interface Data {
    url?: string
    value: string
}

interface FilterConfig {
    autofocusSearch: boolean
    filterPosition: string
    filterTemplateName: string
    filterTemplateOptions: FilterTemplateOptions
    minSearchLength: any
    searchPosition: string
    searchTemplateName: string
    searchTemplateOptions: SearchTemplateOptions
    searchWidth: number
}

interface FilterTemplateOptions {
    filterNames: string[]
    panelTemplateName: any
    storeId: string
}

interface SearchTemplateOptions {
    filterNames: string[]
    storeId: string
}

interface HelpButtonConfig {
    helpUrl: string
}

interface MasterConfig {
    bottomTemplateName: string
    bottomTemplateOptions: BottomTemplateOptions
}

interface BottomTemplateOptions {
    editorsViewMode: string
    filterNames: string[]
    storeId: string
}

interface PrefetchConfig {
    configLoader: string
    configLoaderArguments: ConfigLoaderArguments
    dependencies: string[]
}

interface ConfigLoaderArguments {
    accEORightsId: string
    direction: string
    historyId: string
    scopesAreas: string[]
    toolbarArguments: ToolbarArguments
    typesDocuments: string[]
}

interface ToolbarArguments {
    history: History
    mainLoadButton: MainLoadButton
    unload: Unload
}

interface History {
    activateHandlerArguments: ActivateHandlerArguments
}

interface ActivateHandlerArguments {
    objectNames: string[]
}

interface MainLoadButton {
    activateHandlerArguments: ActivateHandlerArguments2
    load: Load
}

interface ActivateHandlerArguments2 {
    type: string
}

interface Load {
    excelLoaderRegister: string
}

interface Unload {
    visibilityParam: string
}

interface ToolbarConfig {
    actions: string
    getOperationsPanelVisibilityCallback: string
    storeId: string
    useOperationsPanel: boolean
}

interface WorkspaceConfig {
    masterOptions: MasterOptions
    minWidth: number
    templateName: string
}

interface MasterOptions {
    masterWidthProperty: string
    maxWidth: number
    minWidth: number
}


export {
    IPageXRoot,
}
