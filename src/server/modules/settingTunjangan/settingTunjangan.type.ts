export type CreateSettingPayload = {
  baseFare: number;
  keterangan?: string;
  statusAktif?: 'ACTIVE' | 'NON_ACTIVE';
};

export type UpdateSettingPayload = Partial<CreateSettingPayload>;

export type GetAllSettingQuery = {
  status?: 'ACTIVE' | 'NON_ACTIVE';
  page?: string;
  limit?: string;
  noPagination?: string;
};
