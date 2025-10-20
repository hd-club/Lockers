import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Drawer from './Drawer'

const Layout = ({ children }) => {
  return (
    <>
      <TopBar />
      <main className="container">
        {children || <Outlet />}
      </main>
      <BottomNav />
      <Drawer />
    </>
  )
}

export default Layout