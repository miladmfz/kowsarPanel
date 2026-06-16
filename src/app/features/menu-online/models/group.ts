export interface Group {
    GroupCode?: string,
    Name?: string,
    L1?: string,
    L2?: string,
    L3?: string,
    L4?: string,
    L5?: string,
    ChildNo?: string,
    Selected?: boolean,
    Imageitem: string,

}

export interface GroupsResponse { Groups: Group[]; }

