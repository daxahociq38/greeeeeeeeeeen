import { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { SearchIcon } from '../icons/index.jsx';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useApp();
  const { t } = useI18n();
  const [local, setLocal] = useState(searchQuery);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocal(searchQuery);
  }, [searchQuery]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearchQuery(val), 200);
  };

  const handleClear = () => {
    setLocal('');
    setSearchQuery('');
  };

  return (
    <div className="gw-search">
      <SearchIcon size={18} className="gw-search__icon" />
      <input
        type="text"
        className="gw-search__input"
        placeholder={t('searchPlaceholder')}
        value={local}
        onChange={handleChange}
      />
      {local && (
        <button type="button" className="gw-search__clear" onClick={handleClear} aria-label={t('searchClear')}>
          ✕
        </button>
      )}
    </div>
  );
}
