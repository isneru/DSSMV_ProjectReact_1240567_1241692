import { createContext, useContext, useState, type ReactNode } from 'react'
import { AlertButton, AlertPortal } from '~/components'

type AlertContextType = {
	showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
	const [visible, setVisible] = useState(false)
	const [title, setTitle] = useState('')
	const [message, setMessage] = useState<string | undefined>(undefined)
	const [buttons, setButtons] = useState<AlertButton[]>([])

	function showAlert(
		title: string,
		message?: string,
		buttons: AlertButton[] = []
	) {
		setTitle(title)
		setMessage(message)
		setButtons(buttons)
		setVisible(true)
	}

	function hideAlert() {
		setVisible(false)
	}

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			<AlertPortal
				visible={visible}
				title={title}
				message={message}
				buttons={buttons}
				onClose={hideAlert}
			/>
		</AlertContext.Provider>
	)
}

export function useAlert() {
	const context = useContext(AlertContext)
	if (!context) {
		throw new Error('useAlert must be used within an AlertProvider')
	}
	return context
}
