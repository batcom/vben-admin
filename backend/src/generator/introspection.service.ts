import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
  columnComment: string;
  maxLength: number | null;
  isPrimaryKey: boolean;
}

export interface TableInfo {
  tableName: string;
  tableComment: string;
}

@Injectable()
export class IntrospectionService {
  constructor(private prisma: PrismaService) {}

  async listTables(): Promise<TableInfo[]> {
    const result = await this.prisma.$queryRaw<Array<{
      table_name: string;
      table_comment: string;
    }>>`
      SELECT t.table_name, obj_description(t.table_name::regclass) as table_comment
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `;

    return result.map((r) => ({
      tableName: r.table_name,
      tableComment: r.table_comment || '',
    }));
  }

  async getColumns(tableName: string): Promise<ColumnInfo[]> {
    const result = await this.prisma.$queryRaw<Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
      col_description: string | null;
      character_maximum_length: number | null;
    }>>`
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        col_description(c.table_name::regclass, c.ordinal_position) as col_description,
        c.character_maximum_length
      FROM information_schema.columns c
      WHERE c.table_name = ${tableName} AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `;

    const pkColumns = await this.prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${tableName}::regclass AND i.indisprimary
    `;

    const pkSet = new Set(pkColumns.map((p) => p.column_name));

    return result.map((r) => ({
      columnName: r.column_name,
      dataType: r.data_type,
      isNullable: r.is_nullable === 'YES',
      columnDefault: r.column_default,
      columnComment: r.col_description || '',
      maxLength: r.character_maximum_length,
      isPrimaryKey: pkSet.has(r.column_name),
    }));
  }
}
