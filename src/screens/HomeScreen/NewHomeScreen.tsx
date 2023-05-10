import React from 'react'
import ScreenWrapper from 'src/components/ScreenWrapper'
import CurrentPlanView from './components/CurrentPlanView'
import HeaderBar from './components/HeaderBar'
import UAIView from './components/UAIView'

function NewHomeScreen() {
    return (
        <ScreenWrapper barStyle="dark-content">
            <HeaderBar />
            <CurrentPlanView />
            <UAIView />
        </ScreenWrapper>
    )
}

export default NewHomeScreen