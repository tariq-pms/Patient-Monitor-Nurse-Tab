import { ChartOptions } from 'chart.js';
import React, { FC, Ref, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

type TemperatureData = {
    labels: any[];
    datasets: any[]; 
  };
interface MyChartProps {
    data: TemperatureData;
    options: ChartOptions;
    plugins: any;
    forwardedRef: Ref<any>;
    height: string;
  }
  
  const MyChart: FC<MyChartProps> = ({ forwardedRef, data, options, plugins, height }) => {
    // Use useMemo to memoize the chart component
    const chartComponent = useMemo(() => {
      return <Line ref={forwardedRef} data={data} options={options as ChartOptions} plugins={plugins} height={height} />;
    }, [data, options, plugins, height]);
  
    return chartComponent;
  };
  
  export default React.memo(MyChart);