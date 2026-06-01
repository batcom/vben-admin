import { requestClient } from '#/api/request';

export namespace GeneratorApi {
  export interface TableInfo {
    tableName: string;
    tableComment: string;
  }

  export interface ColumnInfo {
    columnName: string;
    dataType: string;
    isNullable: boolean;
    columnDefault: string | null;
    columnComment: string;
    maxLength: number | null;
    isPrimaryKey: boolean;
  }

  export interface GenerateParams {
    tableName: string;
    moduleName: string;
    modulePath: string;
    apiPrefix: string;
  }

  export interface GeneratePreview {
    backend: Record<string, string>;
    frontend: Record<string, string>;
  }

  export interface GenerateResult {
    message: string;
    backendPath: string;
    frontendPath: string;
    files: string[];
  }
}

export async function getTablesApi() {
  return requestClient.get<GeneratorApi.TableInfo[]>('/generator/tables');
}

export async function getTableColumnsApi(tableName: string) {
  return requestClient.get<GeneratorApi.ColumnInfo[]>(
    `/generator/tables/${tableName}/columns`,
  );
}

export async function previewCodeApi(data: GeneratorApi.GenerateParams) {
  return requestClient.post<GeneratorApi.GeneratePreview>(
    '/generator/preview',
    data,
  );
}

export async function generateCodeApi(data: GeneratorApi.GenerateParams) {
  return requestClient.post<GeneratorApi.GenerateResult>(
    '/generator/generate',
    data,
  );
}
