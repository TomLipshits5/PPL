export const MISSING_KEY = '___MISSING_KEY___'
export const MISSING_TABLE_SERVICE = '___MISSING_TABLE_SERVICE___'

export type Table<T> = Readonly<Record<string, Readonly<T>>>

export type TableService<T> = {
    get(key: string): Promise<T>;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
}

// Q 2.1 (a)
export function makeTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>): TableService<T> {
    // optional initialization code
    return {
        get(key: string): Promise<T> {
            let p = new Promise<T>((resolve, reject) => {
                sync().then((table:Table<T>)=>{
                    if (key in table){
                        resolve(table[key])
                    }else{
                        reject(MISSING_KEY)
                    }
                }).catch(()=>{return MISSING_KEY})
            })
            p.then((value: T)=>{
                return value
            }).catch((massage: string)=>{return massage})
            return p
        },
        set(key: string, val: T): Promise<void> {
            let p = new Promise<void>((resolve, reject) => {
                sync().then((table: Table<T>) => {
                    let record : Record<string, T> =  {}
                    Object.assign(record, table)
                    record[key] = val
                    sync(record).then(()=>{}).catch(()=>{})
                    resolve()
                }).catch(()=>{return MISSING_KEY})
            })
            p.then(()=>{return}).catch(()=>{return})
            return p
        },
        delete(key: string): Promise<void> {
            let p = new Promise<void>((resolve, reject) => {
                sync().then((table: Table<T>) => {
                    if (key in table) {
                        const filtered = Object.keys(table)
                            .filter((currKey: string): Boolean => currKey != key)
                            .reduce((obj: Record<string, T>, currKey: string) => {
                                obj[currKey] = table[currKey]
                                return obj;
                            }, {})
                        sync(filtered)
                        resolve()
                    } else {
                        reject(MISSING_KEY)
                    }

                }).catch(() => {
                    return MISSING_KEY
                })
            })
            p.then(() => {
                return
            }).catch((message) => {
                return message
            })
            return p
        }
    }
}

// Q 2.1 (b)
export function getAll<T>(store: TableService<T>, keys: string[]): Promise<T[]> {
    let p = new Promise<T[]>((resolve, reject) => {
        const arr : T[] = []
        for (let i = 0 ; i< keys.length ; i++){
            store.get(keys[i]).then(function (result:T){
                arr.push(result)
                if (i == keys.length -1){
                    resolve(arr)
                }
            }).catch(()=>{reject(MISSING_KEY)});
        }
    });
    p.then((arr: T[]) => {return arr}).catch((message:string)=>{return message})
    return p

}


// Q 2.2
export type Reference = { table: string, key: string }

export type TableServiceTable = Table<TableService<object>>

export function isReference<T>(obj: T | Reference): obj is Reference {
    return typeof obj === 'object' && 'table' in obj
}

export async function constructObjectFromTables(tables: TableServiceTable, ref: Reference) {
    async function deref(ref: Reference) {
        let tableService = tables[ref.table]
        if(tableService == undefined){
            return Promise.reject(MISSING_TABLE_SERVICE)
        }
        try {
            let obj: Record<string, any> = await tableService.get(ref.key)
            for (const [key, val] of Object.entries(obj)){
                if (isReference(val)){
                    try{
                        obj[key] = await deref(val)
                    }catch(err){
                        return Promise.reject(err)
                    }
                }
            }
            return obj
        }catch (err){
            return Promise.reject(err)
        }
    }

    return await deref(ref)
}

// Q 2.3

export function lazyProduct<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        // TODO implement!
    }
}

export function lazyZip<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        // TODO implement!
    }
}

// Q 2.4
export type ReactiveTableService<T> = {
    get(key: string): T;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
    subscribe(observer: (table: Table<T>) => void): void
}

export async function makeReactiveTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>, optimistic: boolean): Promise<ReactiveTableService<T>> {
    // optional initialization code
    let _observer: (table: Table<T>) => void
    let _table = await sync()




    const handleMutation = async (newTable: Table<T>) => {
        try{
            _table = await sync(newTable)
            if (!optimistic && _observer != null){
                _observer(newTable)
            }
        }catch (err) {
            if(_observer != null){
                _observer(_table)
            }
            return Promise.reject(err)
        }
    }
    return {
        get(key: string): T {
            if (key in _table) {
                return _table[key]
            } else {
                throw MISSING_KEY
            }
        },
        set(key: string, val: T): Promise<void> {
            const record: Record<string, T> = {}
            try{
                Object.assign(record, _table)
                record[key] = val
                if (optimistic && _observer != null){
                    _observer(record)
                }
                return handleMutation(record)
            }catch(err){
                return handleMutation(record)
            }
        },

        delete(key: string): Promise<void> {
            const filtered: Record<string, T> = {}
            try{
                for (const [currKey, val] of Object.entries(_table)){
                    if (currKey != key){
                        filtered[currKey] = val
                    }
                }
                if (optimistic && _observer != null){
                    _observer(filtered)
                }
                return handleMutation(filtered)
            }catch(err){
                return handleMutation(filtered)
            }
        },

        subscribe(observer: (table: Table<T>) => void): void {
            _observer = observer
        }
    }
}
