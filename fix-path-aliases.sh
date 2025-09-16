#!/bin/bash

# 修复所有文件中的路径别名问题

echo "开始修复路径别名问题..."

# 修复components目录下的文件
echo "修复components目录下的路径别名..."
find src/components -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "检查文件: $file"
  
  # 修复 @/components/ui/* 路径 (需要根据文件所在子目录深度调整相对路径)
  if grep -q "from \"@/components/ui/" "$file"; then
    echo "  修复 @/components/ui/* 路径 in $file"
    # 计算文件相对于src/components的深度
    depth=$(echo "$file" | sed 's|src/components/||' | grep -o "/" | wc -l)
    if [ $depth -eq 0 ]; then
      # 文件在components根目录
      sed -i '' 's|from "@/components/ui/|from "./ui/|g' "$file"
    elif [ $depth -eq 1 ]; then
      # 文件在components的一级子目录
      sed -i '' 's|from "@/components/ui/|from "../ui/|g' "$file"
    else
      # 文件在components的二级或更深子目录
      sed -i '' 's|from "@/components/ui/|from "../../ui/|g' "$file"
    fi
  fi
  
  # 修复 @/hooks/use-toast 路径
  if grep -q "from \"@/hooks/use-toast" "$file"; then
    echo "  修复 @/hooks/use-toast 路径 in $file"
    sed -i '' 's|from "@/hooks/use-toast"|from "../../hooks/use-toast"|g' "$file"
  fi
  
  # 修复 @/lib/utils 路径
  if grep -q "from \"@/lib/utils" "$file"; then
    echo "  修复 @/lib/utils 路径 in $file"
    sed -i '' 's|from "@/lib/utils"|from "../../lib/utils"|g' "$file"
  fi
  
  # 修复 @/components/* 路径 (非ui目录)
  if grep -q "from \"@/components/" "$file"; then
    # 确保不是ui目录的路径（避免重复替换）
    if ! grep -q "from \"@/components/ui/" "$file"; then
      echo "  修复 @/components/* 路径 in $file"
      sed -i '' 's|from "@/components/|from "../|g' "$file"
    fi
  fi
done

# 修复pages目录下的文件
echo "修复pages目录下的路径别名..."
find src/pages -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "检查文件: $file"
  
  # 修复 @/components/* 路径
  if grep -q "from \"@/components/" "$file"; then
    echo "  修复 @/components/* 路径 in $file"
    sed -i '' 's|from "@/components/|from "../components/|g' "$file"
  fi
  
  # 修复 @/hooks/use-toast 路径
  if grep -q "from \"@/hooks/use-toast" "$file"; then
    echo "  修复 @/hooks/use-toast 路径 in $file"
    sed -i '' 's|from "@/hooks/use-toast"|from "../hooks/use-toast"|g' "$file"
  fi
  
  # 修复 @/lib/utils 路径
  if grep -q "from \"@/lib/utils" "$file"; then
    echo "  修复 @/lib/utils 路径 in $file"
    sed -i '' 's|from "@/lib/utils"|from "../lib/utils"|g' "$file"
  fi
done

# 修复hooks目录下的文件
echo "修复hooks目录下的路径别名..."
find src/hooks -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "检查文件: $file"
  
  # 修复 @/components/* 路径
  if grep -q "from \"@/components/" "$file"; then
    echo "  修复 @/components/* 路径 in $file"
    sed -i '' 's|from "@/components/|from "../components/|g' "$file"
  fi
  
  # 修复 @/lib/utils 路径
  if grep -q "from \"@/lib/utils" "$file"; then
    echo "  修复 @/lib/utils 路径 in $file"
    sed -i '' 's|from "@/lib/utils"|from "../lib/utils"|g' "$file"
  fi
done

echo "路径别名修复完成!"