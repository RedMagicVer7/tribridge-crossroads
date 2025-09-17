/**
 * 用户资料页面
 * @author RedMagicVer7
 */

import React from 'react'
import SiteNavigation from '../components/Layout/SiteNavigation'
import { UserProfile } from '../components/Profile/UserProfile'

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的资料</h1>
          <p className="text-muted-foreground">查看和管理您的个人信息及账户状态</p>
        </div>

        <UserProfile />
      </main>
    </div>
  )
}

export default ProfilePage