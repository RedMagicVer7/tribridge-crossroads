/**
 * 通用表单字段组件
 * 统一表单输入处理和验证显示
 */

import React, { useState, useCallback } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Upload,
  X 
} from 'lucide-react';

import { validateField } from '../../lib/validation';
import type { FormField as FormFieldType, FormOption } from '../../lib/types';

interface FormFieldProps {
  field: FormFieldType;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  showValidation?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  onChange,
  onBlur,
  showValidation = true,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  // 验证字段
  const errors = showValidation && touched ? validateField(field) : [];
  const hasError = errors.length > 0;
  const isValid = touched && !hasError && field.value;

  const handleChange = useCallback((value: any) => {
    onChange(field.name, value);
  }, [field.name, onChange]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (onBlur) {
      onBlur(field.name);
    }
  }, [field.name, onBlur]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (field.type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return field.type;
  };

  const renderInput = () => {
    const commonProps = {
      id: field.name,
      value: field.value || '',
      placeholder: field.placeholder,
      disabled: field.disabled,
      onBlur: handleBlur,
      className: `${hasError ? 'border-destructive' : ''} ${isValid ? 'border-success' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={field.value || ''}
            onValueChange={handleChange}
            disabled={field.disabled}
          >
            <SelectTrigger 
              className={`${hasError ? 'border-destructive' : ''} ${isValid ? 'border-success' : ''}`}
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: FormOption) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <FileInput
            field={field}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={hasError}
            isValid={isValid}
          />
        );

      default:
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={getInputType()}
              onChange={(e) => handleChange(e.target.value)}
            />
            {field.type === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        );
    }
  };

  const renderValidationIcon = () => {
    if (!showValidation || !touched) return null;

    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }

    return null;
  };

  const renderErrors = () => {
    if (!showValidation || !hasError) return null;

    return (
      <div className="space-y-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 标签 */}
      <div className="flex items-center justify-between">
        <Label htmlFor={field.name} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {renderValidationIcon()}
      </div>

      {/* 输入框 */}
      {renderInput()}

      {/* 错误信息 */}
      {renderErrors()}

      {/* 帮助文本 */}
      {field.placeholder && !hasError && (
        <p className="text-sm text-muted-foreground">
          {field.placeholder}
        </p>
      )}
    </div>
  );
};

// 文件上传组件
interface FileInputProps {
  field: FormFieldType;
  onChange: (value: any) => void;
  onBlur: () => void;
  hasError: boolean;
  isValid: boolean;
}

const FileInput: React.FC<FileInputProps> = ({
  field,
  onChange,
  onBlur,
  hasError,
  isValid
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onChange(Array.from(files));
    }
  };

  const removeFile = (index: number) => {
    const currentFiles = field.value || [];
    const newFiles = currentFiles.filter((_: any, i: number) => i !== index);
    onChange(newFiles);
  };

  const files = field.value || [];

  return (
    <div className="space-y-3">
      {/* 拖拽上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${hasError ? 'border-destructive' : ''}
          ${isValid ? 'border-success' : ''}
          ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !field.disabled && document.getElementById(`file-${field.name}`)?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          点击选择文件或拖拽文件到此处
        </p>
        {field.placeholder && (
          <p className="text-xs text-muted-foreground mt-1">
            {field.placeholder}
          </p>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        id={`file-${field.name}`}
        type="file"
        multiple
        onChange={handleFileChange}
        onBlur={onBlur}
        disabled={field.disabled}
        className="hidden"
      />

      {/* 已选择的文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">已选择的文件:</Label>
          <div className="space-y-1">
            {files.map((file: File, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                {!field.disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormField;