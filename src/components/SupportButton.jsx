import SupportButton from '../components/SupportButton'
<SupportButton
  report={r}
  onUpdate={(updatedReport) => {
    setReports(prev => prev.map(item =>
      item._id === updatedReport._id ? updatedReport : item
    ))
  }}
/>