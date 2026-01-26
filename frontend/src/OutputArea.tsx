import type { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import type { MemorialFormData, OutputFormat } from './types';

interface OutputAreaProps {
  watch: UseFormWatch<MemorialFormData>;
  setValue: UseFormSetValue<MemorialFormData>;
  outputText: string;
  onFormatChange: () => void;
}

export default function OutputArea({ watch, setValue, outputText, onFormatChange }: OutputAreaProps) {
  const outputFormat = watch('output_format');

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'SIGAREAS.txt');
  };

  const handleFormatChange = (value: OutputFormat) => {
    setValue('output_format', value);
    onFormatChange();
  };

  return (
    <div className="space-y-4">
      {/* Format Selection */}
      <RadioGroup
        value={outputFormat}
        onValueChange={handleFormatChange}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sigareas" id="output-sigareas" />
          <Label htmlFor="output-sigareas" className="cursor-pointer text-sm">SIGAREAS</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gtmpro" id="output-gtmpro" />
          <Label htmlFor="output-gtmpro" className="cursor-pointer text-sm">GTMPro</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ddegree" id="output-ddegree" />
          <Label htmlFor="output-ddegree" className="cursor-pointer text-sm">Decimal</Label>
        </div>
      </RadioGroup>

      {/* Textarea */}
      <Textarea
        className="h-[280px] resize-none font-mono text-xs bg-slate-900 text-slate-100 border-slate-700"
        value={outputText}
        readOnly
      />

      {/* Download */}
      <Button onClick={handleDownload} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
