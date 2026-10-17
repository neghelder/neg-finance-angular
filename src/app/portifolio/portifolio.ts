import { Asset } from './asset';
import { TotalMetrics } from './totalMetrics';

export interface Portifolio {
  name: string,
  currency_code?: string,
  assets: Asset[],
  metrics: TotalMetrics
}
