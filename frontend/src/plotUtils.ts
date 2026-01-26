export interface PlotlyFigure {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
}

export function createMemorialPlot(
  points: number[][],
  pointsVerd: number[][] | null
): PlotlyFigure {
  const x = points.map(p => p[1]);  // longitude
  const y = points.map(p => p[0]);  // latitude

  const csize = Math.max(3, 9 - x.length / 5);
  const lw = csize < 4 ? 0.5 : 1;

  const arrowMarker = {
    size: csize + 5,
    color: 'gray',
    opacity: 0.3,
    symbol: 'arrow',
    line: { width: lw },
    angleref: 'previous'
  };

  const data: Plotly.Data[] = [
    // Arrows showing direction
    {
      x, y,
      mode: 'lines+markers',
      type: 'scatter',
      marker: arrowMarker,
      hoverinfo: 'none',
      showlegend: false
    } as Plotly.Data,
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
    } as Plotly.Data
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
    } as Plotly.Data);
  }

  const layout: Partial<Plotly.Layout> = {
    autosize: true,
    margin: { l: 60, r: 10, b: 40, t: 10 },
    xaxis: { title: { text: 'Longitude' } },
    yaxis: {
      title: { text: 'Latitude' },
      scaleanchor: 'x',  // Keep 1:1 aspect ratio for coordinates
      scaleratio: 1
    },
    legend: {
      yanchor: 'top', y: 0.99,
      xanchor: 'left', x: 0.01,
      bgcolor: 'rgba(0,0,0,0)'
    }
  };

  return { data, layout };
}
