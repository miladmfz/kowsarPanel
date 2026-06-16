export interface BasketInfo {
    Today?: string,
    RstmizCode?: string,
    RstMizName?: string,
    Explain?: string,
    MizType?: string,
    RstActive?: string,
    PlaceCount?: string,
    MizPrice?: string,
    AppBasketInfoCode?: string,
    TimeStart?: string,
    InfoExplain?: string,
    BrokerRef?: string,
    InfoState?: string,
    BrokerName?: string,
    Res_AppBasketInfoCode?: string,
    ReserveStart?: string,
    ReserveEnd?: string,
    PersonName?: string,
    MobileNo?: string,
    Res_BrokerName?: string,
    IsReserved?: string,

}

export interface BasketInfosResponse { BasketInfos: BasketInfo[]; }
