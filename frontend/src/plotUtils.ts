import { Data, Layout, PlotMarker } from 'plotly.js';

export interface PlotlyFigure {
  data: Data[];
  layout: Partial<Layout>;
}

// Extended marker type to include angleref (not in @types/plotly.js)
interface ArrowMarker extends Partial<PlotMarker> {
  angleref?: 'previous';
}

export function createMemorialPlot(
  points: number[][],
  pointsVerd: number[][] | null
): PlotlyFigure {
  const x = points.map(p => p[1]);  // longitude
  const y = points.map(p => p[0]);  // latitude

  const csize = Math.max(3, 9 - x.length / 5);
  const lw = csize < 4 ? 0.5 : 1;

  const arrowMarker: ArrowMarker = {
    size: csize + 5,
    color: 'gray',
    opacity: 0.3,
    symbol: 'arrow',
    line: { width: lw },
    angleref: 'previous'
  };

  const data: Data[] = [
    // Arrows showing direction
    {
      x, y,
      mode: 'lines+markers',
      type: 'scatter',
      marker: arrowMarker as Partial<PlotMarker>,
      hoverinfo: 'none',
      showlegend: false
    },
    // Input points with index annotations
    {
      x, y,
      text: points.map((_, i) => `${i + 1}`),
      mode: 'text+markers',
      type: 'scatter',
      marker: { size: csize, color: 'blue', opacity: 0.8 },
      textposition: 'top right',
      textfont: { size: 9, color: 'darkblue' },
      name: 'input',
      hoverinfo: 'x+y'
    }
  ];

  // True bearing adjusted points (if applicable)
  if (pointsVerd) {
    data.splice(1, 0, {
      x, y,
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: csize * 1.5,
        color: 'red',
        opacity: 0.8,
        symbol: 'cross',
        line: { width: lw }
      },
      name: 'rumos-v',
      hoverinfo: 'x+y'
    });
  }

  const layout: Partial<Layout> = {
    width: 350,
    height: 350,
    margin: { l: 75, r: 0, b: 40, t: 0 }, 
    xaxis: { title: { text: 'Longitude' } },                                                                                                                                        
    yaxis: { title: { text: 'Latitude' } },        
    legend: {
      yanchor: 'top', y: 0.99,
      xanchor: 'left', x: 0.01,
      bgcolor: 'rgba(0,0,0,0)'
    }
  };

  return { data, layout };
}
