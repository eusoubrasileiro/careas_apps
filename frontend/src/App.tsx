import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Plot = createPlotlyComponent(Plotly);
import InputArea from './InputArea';
import OutputArea from './OutputArea';
import type { MemorialFormData, ConvertResponse, PlotlyData } from './types';
import { SAMPLE_MEMORIAL } from './types';
import { createMemorialPlot } from './plotUtils';
import './index.css';

export default function App() {
  const [outputText, setOutputText] = useState('carregando...');
  const [loading, setLoading] = useState(true);
  const [plotData, setPlotData] = useState<PlotlyData | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<MemorialFormData>({
    defaultValues: {
      input_text: SAMPLE_MEMORIAL,
      input_format: 'scm',
      output_format: 'sigareas',
      rumos_v_tol: '0.5',
      rumos_v: true,
    },
  });

  const onConvert = useCallback(async (formData: MemorialFormData) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('input_text', formData.input_text);
      params.append('input_format', formData.input_format);
      params.append('output_format', formData.output_format);
      params.append('rumos_v_tol', formData.rumos_v_tol);
      if (formData.rumos_v) {
        params.append('rumos-v', 'on');
      }

      const res = await fetch('/flask/convert', {
        method: 'POST',
        body: params,
      });
      const data: ConvertResponse = await res.json();
      setOutputText(data.data);

      if (data.status && data.points) {
        const figure = createMemorialPlot(data.points, data.points_verd);
        setPlotData(figure);
      }
    } catch (error) {
      setOutputText(`Error connecting to backend server: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerConvert = useCallback(() => {
    handleSubmit(onConvert)();
  }, [handleSubmit, onConvert]);

  // Initial load
  useEffect(() => {
    triggerConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Conversor de Memorial</h1>
              <p className="text-sm text-muted-foreground">Converta coordenadas entre formatos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top Row: Input + Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <InputArea
                register={register}
                watch={watch}
                setValue={setValue}
                onSubmit={triggerConvert}
              />
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Saida</CardTitle>
            </CardHeader>
            <CardContent>
              <OutputArea
                watch={watch}
                setValue={setValue}
                outputText={outputText}
                onFormatChange={triggerConvert}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Plot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Visualizacao</CardTitle>
          </CardHeader>
          <CardContent>
            <PlotArea loading={loading} plotData={plotData} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PlotArea({ loading, plotData }: { loading: boolean; plotData: PlotlyData | null }) {
  return (
    <div className="flex items-center justify-center aspect-square max-w-[500px] mx-auto bg-slate-50 rounded-md">
      {loading && (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      )}
      {!loading && plotData && (
        <Plot
          data={plotData.data}
          layout={plotData.layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}
