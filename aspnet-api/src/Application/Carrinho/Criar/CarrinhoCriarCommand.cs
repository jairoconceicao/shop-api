using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.Criar;

public sealed class CarrinhoCriarCommand : IActionCommand<CreateCarrinhoRequest, Result<CarrinhoCriadoResponse>>
{
    private readonly IValidator<CreateCarrinhoRequest> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly ICarrinhoRepository _carrinhoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CarrinhoCriarCommand(
        IValidator<CreateCarrinhoRequest> validator,
        IClienteRepository clienteRepository,
        ICarrinhoRepository carrinhoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _carrinhoRepository = carrinhoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CarrinhoCriadoResponse>> Handle(CreateCarrinhoRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<CarrinhoCriadoResponse>.Failure(
                "Dados invalidos para a criacao do carrinho.",
                validationResult.Errors.ToNotifications());
        }

        var cliente = await _clienteRepository.GetByIdAsync(command.ClienteId);
        if (cliente is null)
        {
            return Result<CarrinhoCriadoResponse>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.ClienteId))
                });
        }

        var carrinho = DomainCarrinho.Create(command.ClienteId, null, DateTime.Now, null);
        await _carrinhoRepository.AddAsync(carrinho);
        await _unitOfWork.SaveChangesAsync();

        return Result<CarrinhoCriadoResponse>.Success(
            new CarrinhoCriadoResponse
            {
                CarrinhoId = carrinho.Id,
                DataCarrinho = carrinho.DataCarrinho
            },
            "Carrinho criado com sucesso.");
    }
}


