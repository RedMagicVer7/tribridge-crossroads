/**
 * 用户资料展示组件
 * @author RedMagicVer7
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Wallet,
  CreditCard,
  Globe
} from "lucide-react"

interface UserProfileProps {
  user?: {
    name: string
    email: string
    phone?: string
    location?: string
    joinDate: string
    avatar?: string
    isVerified: boolean
    kycStatus: 'pending' | 'approved' | 'rejected'
    walletConnected: boolean
    role: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const defaultUser = {
    name: "张三",
    email: "zhangsan@example.com",
    phone: "+86 138 0000 0000",
    location: "上海, 中国",
    joinDate: "2024-01-15",
    avatar: "",
    isVerified: true,
    kycStatus: 'approved' as const,
    walletConnected: true,
    role: "Premium User"
  }

  const profileData = user || defaultUser

  const getKycStatusBadge = () => {
    switch (profileData.kycStatus) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">已认证</Badge>
      case 'pending':
        return <Badge variant="secondary">待审核</Badge>
      case 'rejected':
        return <Badge variant="destructive">未通过</Badge>
      default:
        return <Badge variant="outline">未提交</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 用户基本信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户资料
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/settings'}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑资料
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* 头像和基本信息 */}
            <div className="flex flex-col items-center space-y-4 md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profileData.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
                <p className="text-muted-foreground">{profileData.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  {profileData.isVerified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Shield className="h-3 w-3 mr-1" />
                      已验证
                    </Badge>
                  )}
                  {getKycStatusBadge()}
                </div>
              </div>
            </div>

            {/* 详细信息 */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">邮箱地址</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">电话号码</p>
                    <p className="font-medium">{profileData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">位置</p>
                    <p className="font-medium">{profileData.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">加入时间</p>
                    <p className="font-medium">{new Date(profileData.joinDate).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 账户状态和快捷操作 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              安全状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">双重认证</span>
                <Badge className="bg-green-500 text-white">已启用</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">KYC认证</span>
                {getKycStatusBadge()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">邮箱验证</span>
                <Badge className="bg-green-500 text-white">已验证</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => window.location.href = '/settings?tab=security'}
            >
              安全设置
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              钱包状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">MetaMask</span>
                <Badge className={profileData.walletConnected ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                  {profileData.walletConnected ? "已连接" : "未连接"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">支持网络</span>
                <div className="flex gap-1">
                  <Badge variant="outline">Ethereum</Badge>
                  <Badge variant="outline">BSC</Badge>
                  <Badge variant="outline">Polygon</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              钱包管理
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              会员权益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">账户等级</span>
                <Badge className="bg-purple-500 text-white">Premium</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">交易手续费</span>
                <Badge variant="outline">0.1%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">提现限额</span>
                <span className="text-sm font-medium">无限制</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              升级会员
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}