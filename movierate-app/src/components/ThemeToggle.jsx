import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const ThemeToggle = () => {
  const { settings, updateSetting } = useSettings()

  return (
    <button 
      className="theme-toggle" 
      onClick={() => updateSetting('darkMode', !settings.darkMode)}
      aria-label={`Przełącz na ${settings.darkMode ? 'jasny' : 'ciemny'} motyw`}
    >
      {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default ThemeToggle
