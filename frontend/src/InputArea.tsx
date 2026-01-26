import { useState } from 'react';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Upload, Settings2 } from 'lucide-react';
import type { MemorialFormData } from './types';
import { SAMPLE_MEMORIAL } from './types';

interface InputAreaProps {
  register: UseFormRegister<MemorialFormData>;
  watch: UseFormWatch<MemorialFormData>;
  setValue: UseFormSetValue<MemorialFormData>;
  onSubmit: () => void;
}

export default function InputArea({ register, watch, setValue, onSubmit }: InputAreaProps) {
  const rumosV = watch('rumos_v');
  const inputFormat = watch('input_format');

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
    <div className="space-y-4">
      {/* Format Selection */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <RadioGroup
          value={inputFormat}
          onValueChange={(value) => setValue('input_format', value as 'scm' | 'gtmpro')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="scm" id="input-scm" />
            <Label htmlFor="input-scm" className="cursor-pointer text-sm" title="grau° minuto' segundo'' milisegundos (Cadastro Mineiro)">
              SCM
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gtmpro" id="input-gtmpro" />
            <Label htmlFor="input-gtmpro" className="cursor-pointer text-sm" title="grau° minuto' segundo.decimal'' (TrackMaker)">
              GTMPro
            </Label>
          </div>
        </RadioGroup>

        <div className="flex items-center space-x-2 border-l pl-4">
          <Checkbox
            id="rumos-v"
            checked={rumosV}
            onCheckedChange={(checked) => setValue('rumos_v', checked as boolean)}
          />
          <Label
            htmlFor="rumos-v"
            title="Aproxima latitude/longitude para rumos verdadeiros (NSEW)"
            className="cursor-pointer text-sm"
          >
            Rumos verdadeiros
          </Label>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        className="h-[280px] resize-none font-mono text-xs bg-slate-900 text-slate-100 border-slate-700 focus:border-slate-500"
        defaultValue={SAMPLE_MEMORIAL}
        placeholder="Cole as coordenadas aqui..."
        {...register('input_text')}
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={onSubmit} className="px-6">
          Converter
        </Button>

        <label className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-accent transition-colors">
          <Upload className="h-4 w-4" />
          <span>Arquivo</span>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <MoreOptions register={register} />
      </div>
    </div>
  );
}

function MoreOptions({ register }: {
  register: UseFormRegister<MemorialFormData>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 p-3 bg-muted/50 rounded-md">
        <div className="flex items-center gap-2 text-sm">
          <Label className="text-muted-foreground">Tolerancia rumos-v:</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            defaultValue="0.5"
            className="w-20 h-8"
            {...register('rumos_v_tol')}
          />
          <span className="text-muted-foreground">m</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
