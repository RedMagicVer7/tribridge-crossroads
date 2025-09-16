#!/bin/bash

# 修复所有使用路径别名的导入语句

echo "开始修复路径别名导入问题..."

# 修复 src/components 目录下的文件
echo "修复 src/components 目录下的文件..."
find src/components -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "处理文件: $file"
  
  # 修复 @/components/ui/* 导入
  if grep -q "from \"@/components/ui/" "$file"; then
    sed -i '' 's|from "@/components/ui/|from "../ui/|g' "$file"
  fi
  
  # 修复 @/hooks/* 导入
  if grep -q "from \"@/hooks/" "$file"; then
    sed -i '' 's|from "@/hooks/|from "../../hooks/|g' "$file"
  fi
  
  # 修复 @/lib/* 导入
  if grep -q "from \"@/lib/" "$file"; then
    sed -i '' 's|from "@/lib/|from "../../lib/|g' "$file"
  fi
  
  # 修复 @/components/* 导入（非ui目录）
  if grep -q "from \"@/components/" "$file"; then
    # 确保不是ui目录的导入（避免重复替换）
    if ! grep -q "from \"@/components/ui/" "$file"; then
      sed -i '' 's|from "@/components/|from "../|g' "$file"
    fi
  fi
done

# 修复 src/pages 目录下的文件
echo "修复 src/pages 目录下的文件..."
find src/pages -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "处理文件: $file"
  
  # 修复 @/components/* 导入
  if grep -q "from \"@/components/" "$file"; then
    sed -i '' 's|from "@/components/|from "../components/|g' "$file"
  fi
  
  # 修复 @/hooks/* 导入
  if grep -q "from \"@/hooks/" "$file"; then
    sed -i '' 's|from "@/hooks/|from "../hooks/|g' "$file"
  fi
  
  # 修复 @/lib/* 导入
  if grep -q "from \"@/lib/" "$file"; then
    sed -i '' 's|from "@/lib/|from "../lib/|g' "$file"
  fi
done

# 修复 src/hooks 目录下的文件
echo "修复 src/hooks 目录下的文件..."
find src/hooks -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "处理文件: $file"
  
  # 修复 @/components/* 导入
  if grep -q "from \"@/components/" "$file"; then
    sed -i '' 's|from "@/components/|from "../components/|g' "$file"
  fi
  
  # 修复 @/lib/* 导入
  if grep -q "from \"@/lib/" "$file"; then
    sed -i '' 's|from "@/lib/|from "../lib/|g' "$file"
  fi
done

echo "路径别名导入问题修复完成！"