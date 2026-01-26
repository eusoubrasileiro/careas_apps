import React, { useState } from 'react';
import { Form, Button, Collapse } from 'react-bootstrap';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { MemorialFormData, SAMPLE_MEMORIAL } from './types';

interface InputAreaProps {
  register: UseFormRegister<MemorialFormData>;
  watch: UseFormWatch<MemorialFormData>;
  setValue: UseFormSetValue<MemorialFormData>;
  onSubmit: () => void;
}

export default function InputArea({ register, watch, setValue, onSubmit }: InputAreaProps) {
  const rumosV = watch('rumos_v');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setValue('input_text', event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label>Formato Entrada</Form.Label>
        <div>
          <Form.Check
            inline
            type="radio"
            label="scm"
            value="scm"
            title="grau° minuto' segundo'' milisegundos (Cadastro Mineiro)"
            defaultChecked
            {...register('input_format')}
          />
          <Form.Check
            inline
            type="radio"
            label="gtmpro"
            value="gtmpro"
            title="grau° minuto' segundo.decimal'' (TrackMaker)"
            {...register('input_format')}
          />
          <Form.Check
            inline
            type="checkbox"
            label="rumos-v"
            title="Aproxima latitude/longitude para rumos verdadeiros (NSEW)"
            checked={rumosV}
            onChange={(e) => setValue('rumos_v', e.target.checked)}
          />
        </div>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Control
          as="textarea"
          rows={20}
          defaultValue={SAMPLE_MEMORIAL}
          style={{
            backgroundColor: '#202324',
            color: '#fff',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            resize: 'none',
            minHeight: '200px',
            maxHeight: '400px'
          }}
          {...register('input_text')}
        />
      </Form.Group>

      <div className="d-flex gap-2 mb-2">
        <Button variant="primary" onClick={onSubmit}>
          Converter
        </Button>
        <Form.Control
          type="file"
          onChange={handleFileUpload}
          accept=".txt,.csv"
        />
      </div>

      <MoreOptions register={register} watch={watch} />
    </>
  );
}

function MoreOptions({ register }: {
  register: UseFormRegister<MemorialFormData>;
  watch: UseFormWatch<MemorialFormData>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Mais opcoes
      </Button>
      <Collapse in={open}>
        <div className="mt-2">
          <Form.Group className="d-flex align-items-center gap-2" style={{ width: '80%' }}>
            <Form.Label className="mb-0 text-nowrap">
              <strong>rumos-v</strong>erdadeiros tolerancia
            </Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.5"
              defaultValue="0.5"
              style={{ width: '80px' }}
              {...register('rumos_v_tol')}
            />
            <span>m</span>
            <span
              className="text-info"
              title="Latitudes ou longitudes com distancia geodesica menor que a maxima aqui especificada sao aproximadas. (Elipsoide SIRGAS 2000)"
              style={{ cursor: 'help' }}
            >
              ?
            </span>
          </Form.Group>
        </div>
      </Collapse>
    </>
  );
}
