function FilterBar({ 
  filters, 
  onFilterChange, 
  cardCount, 
  types, 
  classes, 
  subtypes 
}) {
  return (
    <div className="filter-bar">
      <div className="filter-count">
        Showing {cardCount} cards
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => onFilterChange('name', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {types && types.length > 0 ? (
              types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))
            ) : (
              <option value="">No types available</option>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label>Class</label>
          <select
            value={filters.class}
            onChange={(e) => onFilterChange('class', e.target.value)}
          >
            <option value="">All Classes</option>
            {classes && classes.length > 0 ? (
              classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            ) : (
              <option value="">No classes available</option>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label>Subtype</label>
          <select
            value={filters.subtype}
            onChange={(e) => onFilterChange('subtype', e.target.value)}
          >
            <option value="">All Subtypes</option>
            {subtypes && subtypes.length > 0 ? (
              subtypes.map(subtype => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.name}
                </option>
              ))
            ) : (
              <option value="">No subtypes available</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;