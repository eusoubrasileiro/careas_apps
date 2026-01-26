import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import InputArea from './InputArea';
import OutputArea from './OutputArea';
import { MemorialFormData, ConvertResponse, PlotlyData, SAMPLE_MEMORIAL } from './types';
import 'bootstrap/dist/css/bootstrap.min.css';
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

  const fetchPlot = useCallback(async () => {
    try {
      const res = await fetch('/flask/plot', { method: 'POST' });
      const data: PlotlyData = await res.json();
      setPlotData(data);
    } catch (error) {
      console.error('Plot error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (data.status) {
        await fetchPlot();
      } else {
        setLoading(false);
      }
    } catch (error) {
      setOutputText(`Error connecting to backend server: ${error}`);
      setLoading(false);
    }
  }, [fetchPlot]);

  const triggerConvert = useCallback(() => {
    handleSubmit(onConvert)();
  }, [handleSubmit, onConvert]);

  // Initial load
  useEffect(() => {
    triggerConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container id="main-container" className="py-3">
      <h2>Converte formato memorial</h2>
      <Row>
        <Col>
          <InputArea
            register={register}
            watch={watch}
            setValue={setValue}
            onSubmit={triggerConvert}
          />
        </Col>
        <Col>
          <OutputArea
            register={register}
            outputText={outputText}
            onFormatChange={triggerConvert}
          />
        </Col>
        <Col>
          <PlotArea loading={loading} plotData={plotData} />
        </Col>
      </Row>
    </Container>
  );
}

function PlotArea({ loading, plotData }: { loading: boolean; plotData: PlotlyData | null }) {
  return (
    <div id="plot-area">
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {!loading && plotData && (
        <Plot data={plotData.data} layout={plotData.layout} />
      )}
    </div>
  );
}
