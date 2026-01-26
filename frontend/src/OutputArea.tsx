import { Form, Button } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { saveAs } from 'file-saver';
import { MemorialFormData } from './types';

interface OutputAreaProps {
  register: UseFormRegister<MemorialFormData>;
  outputText: string;
  onFormatChange: () => void;
}

export default function OutputArea({ register, outputText, onFormatChange }: OutputAreaProps) {

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'SIGAREAS.txt');
  };

  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label>Formato Saida</Form.Label>
        <div>
          <Form.Check
            inline
            type="radio"
            label="sigareas"
            value="sigareas"
            defaultChecked
            {...register('output_format', { onChange: onFormatChange })}
          />
          <Form.Check
            inline
            type="radio"
            label="gtmpro"
            value="gtmpro"
            {...register('output_format', { onChange: onFormatChange })}
          />
          <Form.Check
            inline
            type="radio"
            label="ddegree"
            value="ddegree"
            {...register('output_format', { onChange: onFormatChange })}
          />
        </div>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Control
          as="textarea"
          rows={20}
          value={outputText}
          readOnly
          style={{
            backgroundColor: '#202324',
            color: '#fff',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            resize: 'none',
            minHeight: '200px',
            maxHeight: '400px'
          }}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleDownload}>
        Download
      </Button>
    </>
  );
}
