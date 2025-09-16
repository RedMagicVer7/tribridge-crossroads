/**
 * 个人信息预览组件
 * @author RedMagicVer7
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Edit, Shield, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

interface ProfilePreviewProps {
  compact?: boolean
}

export function ProfilePreview({ compact = false }: ProfilePreviewProps) {
  const userInfo = {
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "ZS",
    isVerified: true,
    kycStatus: 'approved' as const,
    walletConnected: true,
    role: "Premium User"
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={userInfo.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInfo.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{userInfo.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{userInfo.email}</p>
              <div className="flex items-center gap-1 mt-1">
                {userInfo.isVerified && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    <Shield className="h-3 w-3 mr-1" />
                    已验证
                  </Badge>
                )}
                {userInfo.walletConnected && (
                  <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                    <Wallet className="h-3 w-3 mr-1" />
                    钱包
                  </Badge>
                )}
              </div>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5" />
            个人信息
          </span>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              查看详情
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={userInfo.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {userInfo.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{userInfo.name}</h3>
              <p className="text-muted-foreground">{userInfo.role}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {userInfo.isVerified && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Shield className="h-3 w-3 mr-1" />
                  已验证
                </Badge>
              )}
              <Badge className="bg-green-500 text-white">
                KYC已通过
              </Badge>
              {userInfo.walletConnected && (
                <Badge className="bg-purple-500 text-white">
                  <Wallet className="h-3 w-3 mr-1" />
                  钱包已连接
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>邮箱: {userInfo.email}</p>
              <p>加入时间: 2024年1月15日</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}