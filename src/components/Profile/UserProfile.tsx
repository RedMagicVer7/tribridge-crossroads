/**
 * 用户资料展示组件
 * @author RedMagicVer7
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Link } from "react-router-dom"

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
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                编辑资料
              </Button>
            </Link>
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
            <Link to="/settings?tab=security" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                安全设置
              </Button>
            </Link>
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
                <span className="text-xs text-muted-foreground">ETH, USDC, DAI</span>
              </div>
            </div>
            <Link to="/wallet" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <CreditCard className="h-3 w-3 mr-2" />
                钱包管理
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-4 w-4" />
              偏好设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">语言</span>
                <span className="text-sm font-medium">简体中文</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">货币</span>
                <span className="text-sm font-medium">USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">时区</span>
                <span className="text-sm font-medium">UTC+8</span>
              </div>
            </div>
            <Link to="/settings?tab=preferences" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                偏好设置
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>您最近的账户活动记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">成功完成USDC转账</p>
                  <p className="text-xs text-muted-foreground">2分钟前</p>
                </div>
              </div>
              <Badge variant="outline">交易</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">更新了个人资料</p>
                  <p className="text-xs text-muted-foreground">1小时前</p>
                </div>
              </div>
              <Badge variant="outline">设置</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">连接了新钱包</p>
                  <p className="text-xs text-muted-foreground">昨天</p>
                </div>
              </div>
              <Badge variant="outline">安全</Badge>
            </div>
          </div>
          
          <Link to="/analytics" className="block mt-4">
            <Button variant="ghost" className="w-full">
              查看完整活动记录
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}