#!/bin/bash

# 修复所有UI组件中的路径别名
find src/components/ui -name "*.tsx" -exec grep -l "@/lib/utils" {} \; | while read file; do
  echo "修复文件: $file"
  sed -i '' 's|from "@/lib/utils"|from "../../lib/utils"|g' "$file"
done

echo "所有UI组件文件修复完成"