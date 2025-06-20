import { useState, useEffect, useCallback } from 'react';
import { ArtisansService } from './artisans';
import { Artisan, Commentaire, ArtisanFilters, CreateArtisanData, CreateCommentaireData } from './types';

// Hook pour gérer l'état de chargement et d'erreur
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook pour récupérer tous les artisans
export const useArtisans = () => {
  const [state, setState] = useState<UseApiState<Artisan[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchArtisans = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisans = await ArtisansService.getAllArtisans();
      setState({ data: artisans, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
  }, []);

  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  return { ...state, refetch: fetchArtisans };
};

// Hook pour récupérer un artisan par ID
export const useArtisan = (id: number | null) => {
  const [state, setState] = useState<UseApiState<Artisan>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchArtisan = useCallback(async () => {
    if (!id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisan = await ArtisansService.getArtisanById(id);
      setState({ data: artisan, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
  }, [id]);

  useEffect(() => {
    fetchArtisan();
  }, [fetchArtisan]);

  return { ...state, refetch: fetchArtisan };
};

// Hook pour filtrer les artisans
export const useFilteredArtisans = (filters: ArtisanFilters) => {
  const [state, setState] = useState<UseApiState<Artisan[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchFilteredArtisans = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisans = await ArtisansService.filterArtisans(filters);
      setState({ data: artisans, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
  }, [filters]);

  useEffect(() => {
    fetchFilteredArtisans();
  }, [fetchFilteredArtisans]);

  return { ...state, refetch: fetchFilteredArtisans };
};

// Hook pour rechercher des artisans
export const useSearchArtisans = (searchTerm: string) => {
  const [state, setState] = useState<UseApiState<Artisan[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchArtisans = useCallback(async () => {
    if (!searchTerm.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisans = await ArtisansService.searchArtisans(searchTerm);
      setState({ data: artisans, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(searchArtisans, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [searchArtisans]);

  return { ...state, refetch: searchArtisans };
};

// Hook pour créer un artisan
export const useCreateArtisan = () => {
  const [state, setState] = useState<UseApiState<Artisan>>({
    data: null,
    loading: false,
    error: null,
  });

  const createArtisan = useCallback(async (artisanData: CreateArtisanData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisan = await ArtisansService.createArtisan(artisanData);
      setState({ data: artisan, loading: false, error: null });
      return artisan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState({ data: null, loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  return { ...state, createArtisan };
};

// Hook pour mettre à jour un artisan
export const useUpdateArtisan = () => {
  const [state, setState] = useState<UseApiState<Artisan>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateArtisan = useCallback(async (id: number, artisanData: Partial<CreateArtisanData>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisan = await ArtisansService.updateArtisan(id, artisanData);
      setState({ data: artisan, loading: false, error: null });
      return artisan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState({ data: null, loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  return { ...state, updateArtisan };
};

// Hook pour supprimer un artisan
export const useDeleteArtisan = () => {
  const [state, setState] = useState<UseApiState<void>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteArtisan = useCallback(async (id: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await ArtisansService.deleteArtisan(id);
      setState({ data: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState({ data: null, loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  return { ...state, deleteArtisan };
};

// Hook pour ajouter un commentaire
export const useAddCommentaire = () => {
  const [state, setState] = useState<UseApiState<Commentaire>>({
    data: null,
    loading: false,
    error: null,
  });

  const addCommentaire = useCallback(async (commentaireData: CreateCommentaireData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const commentaire = await ArtisansService.addCommentaire(commentaireData);
      setState({ data: commentaire, loading: false, error: null });
      return commentaire;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState({ data: null, loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  return { ...state, addCommentaire };
};

// Hook pour obtenir les artisans les mieux notés
export const useTopRatedArtisans = (limit: number = 10) => {
  const [state, setState] = useState<UseApiState<Artisan[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTopRated = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const artisans = await ArtisansService.getTopRatedArtisans(limit);
      setState({ data: artisans, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchTopRated();
  }, [fetchTopRated]);

  return { ...state, refetch: fetchTopRated };
}; 