# Pharmacy POS System

## Overview

The Pharmacy POS (Point of Sale) system is a comprehensive React-based frontend component designed for pharmacy operations. It provides a modern, responsive interface for processing sales, managing inventory, and handling prescriptions.

## Features

### Core Functionality
- **Barcode Scanning**: Support for barcode input and scanning
- **Item Search**: Search items by name, SKU, or generic name
- **Cart Management**: Add, remove, and update item quantities
- **Patient Selection**: Link sales to specific patients
- **Prescription Mode**: Process prescription-based sales
- **Payment Processing**: Support for cash, card, and online payments
- **Real-time Calculations**: Automatic subtotal, tax, and total calculations

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Keyboard Navigation**: Full keyboard support for efficient operation
- **Auto-focus**: Intelligent focus management for barcode scanners
- **Real-time Updates**: Instant feedback for all user actions

## Component Structure

### Main Component: `PharmacyPOS`
The main component that orchestrates all POS functionality.

### State Management
```javascript
const [cart, setCart] = useState([]);                    // Shopping cart items
const [searchTerm, setSearchTerm] = useState('');        // Search input
const [searchResults, setSearchResults] = useState([]);  // Search results
const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient
const [paymentMethod, setPaymentMethod] = useState('cash');   // Payment method
const [prescriptionMode, setPrescriptionMode] = useState(false); // Prescription mode
```

### Key Functions
- `searchItems(term, type)`: Search for items by term or barcode
- `addToCart(item)`: Add item to shopping cart
- `updateQuantity(cartId, quantity)`: Update item quantity
- `processSale()`: Process the sale and create invoice
- `searchPatients(term)`: Search for patients
- `clearCart()`: Clear all cart items

## API Integration

### Backend Endpoints
- `GET /api/pharmacy/items?search={term}`: Search items
- `POST /api/pharmacy/sales`: Process sale
- `GET /api/patients?search={term}`: Search patients

### Data Flow
1. **Item Search**: User searches for items → API call → Results displayed
2. **Cart Management**: Items added/removed → Local state updated → Calculations updated
3. **Sale Processing**: Cart data → API call → Invoice created → Cart cleared

## UI Components

### Header Section
- Pharmacy branding and title
- Patient selection/display
- Responsive layout for different screen sizes

### Left Panel
- **Barcode Input**: Primary input for barcode scanning
- **Search Section**: Text-based item search
- **Prescription Toggle**: Enable/disable prescription mode
- **Search Results**: Grid display of found items

### Right Panel
- **Cart Header**: Cart title and clear button
- **Cart Items**: List of items with quantity controls
- **Cart Summary**: Subtotal, tax, and total calculations
- **Payment Method**: Radio button selection
- **Action Buttons**: Process sale, print receipt, save draft

### Modal Components
- **Patient Selection**: Search and select patients
- **Responsive Design**: Adapts to different screen sizes

## Styling

### CSS Architecture
- **Component-based**: Styles scoped to POS component
- **CSS Variables**: Consistent color scheme and spacing
- **Responsive Breakpoints**: Mobile-first approach
- **Modern CSS**: Flexbox, Grid, and CSS animations

### Color Scheme
- **Primary**: Blue (#3b82f6) for interactive elements
- **Success**: Green (#10b981) for positive actions
- **Warning**: Red (#ef4444) for destructive actions
- **Neutral**: Gray scale for text and borders

### Responsive Design
- **Desktop**: Two-column layout (search + cart)
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Single-column layout with reordered panels

## Usage Examples

### Basic Sale Flow
```javascript
// 1. Search for items
await searchItems('paracetamol');

// 2. Add to cart
addToCart(searchResults[0]);

// 3. Select patient (optional)
setSelectedPatient(patientData);

// 4. Process sale
await processSale();
```

### Prescription Mode
```javascript
// Enable prescription mode
setPrescriptionMode(true);

// Enter prescription ID
setPrescriptionId('PRES001');

// Process prescription-based sale
await processSale();
```

## Integration Points

### With Pharmacy Dashboard
- Accessible from main pharmacy navigation
- Shares patient and item data
- Consistent styling and branding

### With E-Prescription System
- Receives prescription IDs
- Validates prescription requirements
- Links sales to prescriptions

### With Inventory System
- Real-time stock checking
- Automatic stock deduction
- Batch tracking support

## Error Handling

### User Feedback
- Loading states for API calls
- Error messages for failed operations
- Success confirmations for completed actions

### Validation
- Cart empty checks
- Prescription ID validation
- Patient selection requirements

## Performance Considerations

### Optimization
- Debounced search inputs
- Efficient state updates
- Minimal re-renders
- Lazy loading for large datasets

### Memory Management
- Cleanup of event listeners
- Proper state cleanup
- Modal unmounting

## Testing

### Unit Tests
- Component rendering
- State management
- User interactions
- API integration

### Integration Tests
- End-to-end sale flow
- Error scenarios
- Responsive behavior

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- ES6+ JavaScript
- CSS Grid and Flexbox
- CSS Custom Properties
- Modern CSS animations

## Accessibility

### Standards Compliance
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

### Features
- ARIA labels and roles
- Focus management
- Semantic HTML structure
- Color contrast ratios

## Future Enhancements

### Planned Features
- **Offline Support**: Local storage for offline operations
- **Receipt Printing**: Thermal printer integration
- **Payment Gateway**: Online payment processing
- **Inventory Sync**: Real-time stock updates
- **Analytics**: Sales performance metrics

### Technical Improvements
- **TypeScript**: Full type safety
- **State Management**: Redux or Zustand integration
- **Testing**: Comprehensive test coverage
- **Performance**: Virtual scrolling for large lists

## Troubleshooting

### Common Issues
1. **Items not loading**: Check backend API connectivity
2. **Cart not updating**: Verify state management
3. **Search not working**: Check API endpoint configuration
4. **Styling issues**: Verify CSS file loading

### Debug Mode
Enable console logging for debugging:
```javascript
// Add to component for debugging
console.log('Cart state:', cart);
console.log('Search results:', searchResults);
```

## Support

### Documentation
- This README file
- Component code comments
- API documentation
- Integration guides

### Development
- React best practices
- Modern JavaScript patterns
- CSS architecture guidelines
- Testing strategies

---

*Last updated: December 2024*
*Version: 1.0.0*
