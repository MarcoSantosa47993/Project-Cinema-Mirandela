
const router = require('express').Router();
const Movie = require('../models/moviesModel');
const authMiddleware = require('../middlewares/authMiddleware')
const Sessao = require('../models/sessaoModel')
const request = require('request');
let api_key = "6635b7e1a61ddb3d10ce68e15b8fd930"
const fetch = require('node-fetch');
const axios = require('axios');


const apiKey = '6635b7e1a61ddb3d10ce68e15b8fd930';



//Add a new Movie

router.post("/add-movie", authMiddleware, async (req, res) => {

    
        
        //await newMovie.save();
       console.log("Body -> " + req.body.idioma)
       const movieName = req.body.titulo;
 console.log(movieName)
 axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieName)}&language=pt-BR`)
  .then(response => {
    const results = response.data.results;

    if (results.length > 0) {
      const movieId = results[0].id; // Obtém o ID do primeiro filme da lista
      console.log(movieId)

      axios.get(`http://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&type=Trailer`)
      .then(response => {
        const trailers = response.data.results.filter(video => video.type === "Trailer");
        console.log(trailers)
      
      // Obter detalhes do filme pelo ID
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits&language=pt-BR`)
        .then(response => {
          const movie = response.data;

          // Acesso às informações do elenco
          const cast = movie.credits.cast;
          const releaseDate = movie.release_date;
          const duration = movie.runtime;
          const rating = movie.vote_average;
          const director = movie.credits.crew.find(member => member.job === 'Director');
          const directorName = director ? director.name : 'Não disponível';
          const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          const trailer = `https://www.youtube.com/watch?v=${trailers[0].key}`
          
       
          // Obter as categorias do filme
          const genreIds = movie.genres.map(genre => genre.id);


          axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`)
            .then(response => {
              const genres = response.data.genres;
              const movieGenres = genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name);

              console.log(movieGenres)

              console.log('Detalhes do filme:');
              console.log('Título:', movie.title);
              console.log('Descrição:', movie.overview);
              console.log('Diretor:', directorName);
              console.log('Data de Lançamento:', releaseDate);
              console.log('Duração:', duration + ' min');
              console.log('Rating:', rating);
              console.log('Poster URL:', posterUrl);
              console.log('Trailer:', trailer);
              console.log('Elenco:');
              var elenco = '';
              var categoria = ''
              for (let i = 0; i < 5; i++) {
                if (i + 1 == 5) {
                  elenco += cast[i].name + '.';
                } else {
                  elenco += cast[i].name + ', ';
                }
              }

              for (let i = 0; i < movieGenres.length; i++) {
                if (i + 1 == movieGenres.length) {
                    categoria += movieGenres[i] + '.';
                } else {
                    categoria += movieGenres[i] + '/ ';
                }
              }
              console.log(categoria)
              const filme = {
                titulo: movie.title,
                realizador: directorName,
                elenco: elenco,
                descricao: movie.overview,
                data: releaseDate,
                duracao: duration,
                avaliacao: rating,
                poster: posterUrl,
                genero: categoria,
                trailer: trailer,
                idioma: req.body.idiomas,
                idade: req.body.idade,
                distribuidora: req.body.distribuidora,
              };

              try {
                const newMovie = new Movie(filme);
                console.log(newMovie);
                newMovie.save();

                res.send({
                  success: true,
                  message: "Filme adicionado com sucesso"
                });
              } catch (error) {
                console.error('Erro ao salvar o filme:', error);
                res.send({
                  success: false,
                  message: "Erro ao adicionar o filme"
                });
              }
            })
            .catch(error => {
              console.error('Erro ao obter as categorias do filme:', error);
              res.send({
                success: false,
                message: "Erro ao obter as categorias do filme"
              });
            });

            
})
      .catch( error => console.error( error));


        })
        .catch(error => {
          console.error('Erro ao obter detalhes do filme:', error);
          res.send({
            success: false,
            message: "Erro ao obter detalhes do filme"
          });
        });



    } else {
      console.log('Nenhum filme encontrado.');
      res.send({
        success: false,
        message: "Nenhum filme encontrado"
      });
    }
  })
  .catch(error => {
    console.error('Erro ao pesquisar filmes:', error);
    res.send({
      success: false,
      message: "Erro ao pesquisar filmes"
    });
  });

});


//get all movies
router.get("/get-all-movies", async (req, res) => {
    try {
      const movies = await Movie.find({ estado: { $ne: "Eliminado" } })
      .sort({ createdAt: -1 })
      .populate("idioma");
        res.send({
            success: true,
            message: "Movies fetched sucessfully",
            data: movies,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
})


//edit movie
router.post("/update-movie", authMiddleware, async (req, res) => {
  const movieName = req.body.titulo;

  try {
      // Verifica se existem sessões associadas ao filme
      const sessoes = await Sessao.find({ filme: req.body.movieId });
      for (let s of sessoes) {
        if (s.estado === "Criada" || s.estado === "A decorrer") {
            return res.send({
                success: false,
                message: "Existem sessões associadas a este filme. Por favor, elimine primeiro as sessões antes de atualizar."
            });
        }
    }
    const searchResponse = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieName)}&language=pt-BR`);
    const results = searchResponse.data.results;

    if (!results.length) {
      return res.send({
        success: false,
        message: "Nenhum filme encontrado"
      });
    }

    const movieId = results[0].id;

    const trailerResponse = await axios.get(`http://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&type=Trailer`);
    const trailers = trailerResponse.data.results.filter(video => video.type === "Trailer");

    const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits&language=pt-BR`);
    const movie = detailsResponse.data;

    const cast = movie.credits.cast;
    const director = movie.credits.crew.find(member => member.job === 'Director');
    const directorName = director ? director.name : 'Não disponível';

    const genreIds = movie.genres.map(genre => genre.id);
    const genresResponse = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`);
    const genres = genresResponse.data.genres;
    const movieGenres = genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name);

    const elenco = cast.slice(0, 5).map(actor => actor.name).join(', ');

    const categoria = movieGenres.join(' / ');

    const filme = {
      titulo: movie.title,
      realizador: directorName,
      elenco: elenco,
      descricao: movie.overview,
      data: movie.release_date,
      duracao: movie.runtime,
      avaliacao: movie.vote_average,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      genero: categoria,
      trailer: `https://www.youtube.com/watch?v=${trailers[0].key}`,
      idioma: req.body.idioma,
      idade: req.body.idade,
      distribuidora: req.body.distribuidora,
    };
    
    const hello = await Movie.findByIdAndUpdate(req.body.movieId, filme);


    res.send({
      success: true,
      message: "Filme Atualizado com sucesso"
    });

  } catch (error) {
    console.error('Erro:', error);
    res.send({
      success: false,
      message: "Erro ao processar sua requisição"
    });
  }
});
        

//apagar filme
router.post("/delete-movie", authMiddleware, async (req, res) => {
  try {
    let filme = req.body.movieId;
    console.log({ filme });

    // Encontrar todas as sessões associadas ao filme
    const sessoes = await Sessao.find({ filme });

    // Verificar se alguma dessas sessões tem o estado 'Criada' ou 'a Decorrer'
    const hasActiveSessions = sessoes.some(sessao => sessao.estado === 'Criada' || sessao.estado === 'a Decorrer');

    if (!hasActiveSessions) {
        req.body.estado = "Eliminado"
        await Movie.findByIdAndUpdate(filme,req.body)
        res.send({
            success: true,
            message: "Filme eliminado com sucesso"
        });
    } else {
        res.send({
            success: false,
            message: "Existem sessões associadas a este filme com estado 'Criada' ou 'a Decorrer', por favor elimine primeiro as sessões"
        });
    }
} catch (error) {
    res.send({
        success: false,
        message: error.message,
    });
}
})

router.get("/get-movie-by-id/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).populate("idioma").populate("distribuidora")
        res.send({
            success: true,
            message: "Filme carregado com sucesso",
            data: movie,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,

        })
    }
})



module.exports = router;