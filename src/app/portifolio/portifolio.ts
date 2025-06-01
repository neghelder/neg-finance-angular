import { Asset } from './asset';
import { TotalMetrics } from './totalMetrics';

export interface Portifolio {
  name: string,
  assets: Asset[],
  metrics: TotalMetrics
}
